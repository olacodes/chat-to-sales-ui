export interface AuthUser {
  user_id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
  tenantId: string;
}

/** Raw shape returned by every auth endpoint */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  tenant_id: string;
}
