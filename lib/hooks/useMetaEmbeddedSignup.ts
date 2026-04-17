'use client';

/**
 * useMetaEmbeddedSignup
 *
 * Manages the full Meta WhatsApp Embedded Signup lifecycle:
 *   1. Loads the Facebook JS SDK asynchronously (once, idempotent)
 *   2. Registers the WA_EMBEDDED_SIGNUP window.message listener
 *   3. Exposes `launch()` which opens the Meta popup via FB.login()
 *   4. Returns a `session` object once the user successfully completes the flow;
 *      send this to your backend to exchange the code for a business token.
 *
 * Required env vars:
 *   NEXT_PUBLIC_META_APP_ID          — your Meta App ID
 *   NEXT_PUBLIC_META_CONFIG_ID       — Facebook Login for Business configuration ID
 *   NEXT_PUBLIC_META_GRAPH_VERSION   — Graph API version, e.g. "v25.0"
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Facebook SDK minimal type declarations ───────────────────────────────────

interface FbInitParams {
  appId: string;
  autoLogAppEvents: boolean;
  xfbml: boolean;
  version: string;
}

interface FbLoginOptions {
  config_id: string;
  response_type: 'code';
  override_default_response_type: boolean;
  extras?: { setup?: object };
}

interface FbLoginResponse {
  authResponse: { code: string } | null;
  status: string;
}

interface FbSdk {
  init(params: FbInitParams): void;
  login(callback: (response: FbLoginResponse) => void, options: FbLoginOptions): void;
}

declare global {
  interface Window {
    FB: FbSdk;
    fbAsyncInit: () => void;
  }
}

// ─── WA_EMBEDDED_SIGNUP message event shapes ──────────────────────────────────

interface WaSignupFinish {
  type: 'WA_EMBEDDED_SIGNUP';
  event: 'FINISH';
  data: {
    phone_number_id: string;
    waba_id: string;
    business_id: string;
  };
}

interface WaSignupCancel {
  type: 'WA_EMBEDDED_SIGNUP';
  event: 'CANCEL';
  data: {
    current_step?: string;
    error_message?: string;
    error_code?: string;
  };
}

type WaSignupMessage = WaSignupFinish | WaSignupCancel;

// ─── Public types ─────────────────────────────────────────────────────────────

/** Data returned to the caller after the user completes the Meta popup. */
export interface EmbeddedSignupSession {
  /**
   * Short-lived exchangeable code (30-second TTL).
   * Send to your backend immediately to exchange for a business token.
   */
  code: string;
  phone_number_id: string;
  waba_id: string;
}

export type SdkStatus =
  | 'loading' // SDK script is being fetched
  | 'ready' // SDK initialised, flow can be launched
  | 'pending' // Meta popup is open
  | 'cancelled' // User closed the popup without completing
  | 'error'; // SDK failed to load or a hard error occurred

// ─── Config ───────────────────────────────────────────────────────────────────

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? '';
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID ?? '';
const META_GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION ?? 'v25.0';
const FB_SDK_SCRIPT_ID = 'meta-fb-sdk';

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @example
 * const { sdkStatus, launch, session, clearSession } = useMetaEmbeddedSignup();
 *
 * // Watch session — when non-null, exchange with backend then clear
 * useEffect(() => {
 *   if (!session) return;
 *   bindToBackend(session).finally(() => clearSession());
 * }, [session, clearSession]);
 */
export function useMetaEmbeddedSignup() {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>('loading');
  const [session, setSession] = useState<EmbeddedSignupSession | null>(null);

  // Collect partial data from the two independent callbacks before merging
  const pendingCodeRef = useRef<string | null>(null);
  const pendingAssetRef = useRef<Pick<EmbeddedSignupSession, 'phone_number_id' | 'waba_id'> | null>(
    null,
  );

  /**
   * Attempt to merge the code (from FB.login callback) and asset IDs
   * (from the WA_EMBEDDED_SIGNUP message event) into a full session.
   * Either can arrive first — merge fires only when both are present.
   */
  const tryMerge = useCallback(() => {
    const code = pendingCodeRef.current;
    const asset = pendingAssetRef.current;
    if (!code || !asset) return;

    pendingCodeRef.current = null;
    pendingAssetRef.current = null;
    setSession({ code, ...asset });
    setSdkStatus('ready');
  }, []);

  const clearSession = useCallback(() => setSession(null), []);

  // ── SDK script loading ────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // SDK already initialised (e.g. hot reload)
    if (window.FB) {
      setSdkStatus('ready');
      return;
    }

    // Register fbAsyncInit BEFORE injecting the script tag so it fires
    // immediately after the SDK loads, regardless of timing.
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: META_GRAPH_VERSION,
      });
      setSdkStatus('ready');
    };

    // Script tag already injected by a previous mount (React StrictMode double-invoke)
    if (document.getElementById(FB_SDK_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = FB_SDK_SCRIPT_ID;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => setSdkStatus('error');
    document.head.appendChild(script);

    // Intentionally do NOT remove the script on cleanup — the SDK is a
    // singleton and removing it mid-session causes errors.
  }, []);

  // ── WA_EMBEDDED_SIGNUP message event listener ─────────────────────────────

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from facebook.com origins
      if (typeof event.origin !== 'string' || !event.origin.endsWith('facebook.com')) return;

      let data: WaSignupMessage;
      try {
        data = JSON.parse(event.data as string) as WaSignupMessage;
      } catch {
        return; // Non-JSON frame (e.g. heartbeat) — ignore
      }

      if (data.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (data.event === 'FINISH') {
        pendingAssetRef.current = {
          phone_number_id: data.data.phone_number_id,
          waba_id: data.data.waba_id,
        };
        tryMerge();
      } else if (data.event === 'CANCEL') {
        // User abandoned the flow or an error was reported
        pendingCodeRef.current = null;
        pendingAssetRef.current = null;
        setSdkStatus('cancelled');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [tryMerge]);

  // ── Launch ────────────────────────────────────────────────────────────────

  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const launch = useCallback(() => {
    if (typeof window === 'undefined' || !window.FB) return;

    // Guard: refuse to launch if required config is missing
    if (!META_APP_ID || !META_CONFIG_ID) {
      console.error(
        '[useMetaEmbeddedSignup] NEXT_PUBLIC_META_APP_ID or NEXT_PUBLIC_META_CONFIG_ID is not set.',
      );
      setSdkStatus('error');
      return;
    }

    // Reset any leftover partial state from a previous attempt
    pendingCodeRef.current = null;
    pendingAssetRef.current = null;
    setSdkStatus('pending');

    // Safety net: if neither callback fires within 5 minutes
    // (popup blocked, SDK bug, etc.) auto-reset so the user can retry.
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    pendingTimeoutRef.current = setTimeout(
      () => {
        setSdkStatus((prev) => (prev === 'pending' ? 'cancelled' : prev));
      },
      5 * 60 * 1_000,
    );

    try {
      window.FB.login(
        (response) => {
          if (pendingTimeoutRef.current) {
            clearTimeout(pendingTimeoutRef.current);
            pendingTimeoutRef.current = null;
          }
          if (response.authResponse) {
            pendingCodeRef.current = response.authResponse.code;
            tryMerge();
          } else {
            // User closed the popup without completing, or popup was blocked.
            // The WA_EMBEDDED_SIGNUP CANCEL message event is the primary signal;
            // this handles the cases where that event doesn't fire.
            setSdkStatus('cancelled');
          }
        },
        {
          config_id: META_CONFIG_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: { setup: {} },
        },
      );
    } catch (err) {
      console.error('[useMetaEmbeddedSignup] FB.login() threw:', err);
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
      setSdkStatus('cancelled');
    }
  }, [tryMerge]);

  return { sdkStatus, launch, session, clearSession };
}
