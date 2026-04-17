/**
 * Token store — a tiny mutable singleton that bridges the auth store and the
 * API client without creating a circular dependency.
 *
 *   Auth store → setToken()  (on login / logout / session restore)
 *   API client → getToken()  (on every outbound request)
 *
 * No React, no Zustand — just a module-level variable.
 */

let _token: string | null = null;
let _tenantId: string | null = null;

export function setToken(token: string | null): void {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

export function setTenantId(tenantId: string | null): void {
  _tenantId = tenantId;
}

export function getTenantId(): string | null {
  return _tenantId;
}
