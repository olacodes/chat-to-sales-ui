import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { setToken, setTenantId } from '@/lib/auth/tokenStore';
import type { AuthSession, AuthUser } from '@/lib/auth/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  /** Call after a successful login or session restore */
  setSession: (session: AuthSession) => void;
  /** Call on logout */
  clearSession: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      accessToken: null,
      user: null,
      tenantId: null,
      isAuthenticated: false,

      setSession: (session) => {
        setToken(session.accessToken);
        setTenantId(session.tenantId);
        set(
          {
            accessToken: session.accessToken,
            user: session.user,
            tenantId: session.tenantId,
            isAuthenticated: true,
          },
          false,
          'auth/setSession',
        );
      },

      clearSession: () => {
        setToken(null);
        setTenantId(null);
        set(
          { accessToken: null, user: null, tenantId: null, isAuthenticated: false },
          false,
          'auth/clearSession',
        );
      },
    }),
    { name: 'auth' },
  ),
);
