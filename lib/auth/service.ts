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

export function logout(): void {
  eraseSession();
  useAuthStore.getState().clearSession();
}
