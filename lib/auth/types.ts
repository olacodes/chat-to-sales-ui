export interface AuthUser {
  user_id: string;
  /** Present for email-based accounts; absent for phone-only traders */
  email?: string;
  phone_number?: string;
}

/** Returned by GET /api/v1/auth/invite/trader/{token} */
export interface TraderInvite {
  phone_number: string;
  referrer_name?: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
  tenantId: string;
  storeSlug?: string;
}

/** Raw shape returned by every auth endpoint */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  tenant_id: string;
  /** Returned after phone-based signup when a store is created */
  store_slug?: string;
}
