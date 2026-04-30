export interface AuthUser {
  user_id: string;
  email: string;
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
