/**
 * Auth service — the only file that calls auth endpoints and manages
 * session persistence. All UI code should import from here, not call
 * apiClient directly for auth operations.
 *
 * Token storage strategy:
 *  - Primary:    Zustand in-memory (lost on hard reload)
 *  - Persistence: sessionStorage (survives same-tab refresh; cleared on tab close)
 *  - Middleware:  A lightweight cookie `cts-session=1` (holds NO sensitive data)
 *                 is set so Next.js middleware can protect server-side routes
 *                 without the JWT ever touching a cookie.
 */

import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthResponse, AuthSession } from './types';

// ─── Session persistence keys ─────────────────────────────────────────────────

const SESSION_KEY = 'cts-auth-session';
const SESSION_COOKIE = 'cts-session';

// ─── Private helpers ──────────────────────────────────────────────────────────

function persistSession(session: AuthSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage unavailable (private browsing restrictions) — fine, in-memory still works
  }
  // Lightweight presence cookie — NO JWT, just signals "authenticated" to middleware
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`;
}

function eraseSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

function applySession(data: AuthResponse): AuthSession {
  const session: AuthSession = {
    accessToken: data.access_token,
    user: data.user,
    tenantId: data.tenant_id,
  };

  persistSession(session);

  useAuthStore.getState().setSession(session);
  return session;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Attempt to restore a session from sessionStorage on app boot. */
export function restoreSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as AuthSession;
    useAuthStore.getState().setSession(session);
  } catch {
    // Corrupted storage — silently ignore
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  const data = await apiClient.post<AuthResponse>('/api/v1/auth/login/email', { email, password });
  return applySession(data);
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const data = await apiClient.post<AuthResponse>('/api/v1/auth/login/google', {
    id_token: idToken,
  });
  return applySession(data);
}

export async function requestOtp(phoneNumber: string): Promise<void> {
  await apiClient.post('/api/v1/auth/otp/request', { phone_number: phoneNumber });
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<AuthSession> {
  const data = await apiClient.post<AuthResponse>('/api/v1/auth/otp/verify', {
    phone_number: phoneNumber,
    code,
  });
  return applySession(data);
}

export function logout(): void {
  eraseSession();
  useAuthStore.getState().clearSession();
}

/**
 * Apply a session from the invite-acceptance endpoint, which returns a flat
 * { access_token, user_id, tenant_id, email } shape instead of the standard
 * AuthResponse shape used by login/signup.
 */
export function applyInviteSession(data: {
  access_token: string;
  user_id: string;
  tenant_id: string;
  email: string;
}): AuthSession {
  return applySession({
    access_token: data.access_token,
    token_type: 'bearer',
    user: { user_id: data.user_id, email: data.email },
    tenant_id: data.tenant_id,
  });
}
