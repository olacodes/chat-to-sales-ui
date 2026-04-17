/**
 * ChatToSales — Base API client
 *
 * Features:
 * - Automatic tenant_id injection on every request
 * - Configurable request timeout (default 10 s)
 * - Normalised ApiError with status code and structured body
 * - Dev-mode request/response logging
 *
 * Usage:
 *   import { apiClient } from '@/lib/api/client';
 *   const health = await apiClient.get<HealthResponse>('/health');
 */

import { BASE_URL, DEFAULT_TIMEOUT_MS } from './config';
import { getToken, getTenantId } from '@/lib/auth/tokenStore';

// ─── Error types ───────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ─── Dev logger ──────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== 'production';

function logApi(method: string, path: string, status?: number, durationMs?: number) {
  if (!isDev) return;
  const tag = status === undefined ? '→' : status < 400 ? '←' : '✗';
  const statusStr = status !== undefined ? ` [${status}]` : '';
  const durStr = durationMs !== undefined ? ` (${durationMs}ms)` : '';
  console.debug(`[api] ${tag} ${method} ${path}${statusStr}${durStr}`);
}

// ─── Tenant injection ─────────────────────────────────────────────────────────

/**
 * Appends ?tenant_id=… to a URL unless the param is already present.
 * Called on every outbound request to enforce multi-tenant isolation.
 */
function withTenantId(url: string): string {
  const tenantId = getTenantId();
  if (!tenantId) return url;
  if (url.includes('tenant_id=')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}tenant_id=${encodeURIComponent(tenantId)}`;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Extra headers merged on top of the defaults */
  headers?: Record<string, string>;
  /** Optional AbortSignal for cancellation */
  signal?: AbortSignal;
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody> {
  try {
    const json = await res.json();
    return {
      message: json?.message ?? res.statusText,
      code: json?.code,
      details: json?.details,
    };
  } catch {
    return { message: res.statusText || `HTTP ${res.status}` };
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;
  const t0 = performance.now();

  // ── Timeout ────────────────────────────────────────────────────────────────
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () =>
      timeoutController.abort(
        new DOMException(`Request timed out after ${DEFAULT_TIMEOUT_MS}ms`, 'TimeoutError'),
      ),
    DEFAULT_TIMEOUT_MS,
  );
  // Forward caller cancellation into the timeout controller
  signal?.addEventListener('abort', () => timeoutController.abort(signal.reason), { once: true });

  // ── Build URL with tenant isolation ───────────────────────────────────────
  const url = withTenantId(`${BASE_URL}${path}`);
  logApi(method, path);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: timeoutController.signal,
    });

    if (!res.ok) {
      const errorBody = await parseErrorBody(res);
      logApi(method, path, res.status, Math.round(performance.now() - t0));
      throw new ApiError(res.status, errorBody);
    }

    logApi(method, path, res.status, Math.round(performance.now() - t0));

    // 204 No Content — return undefined cast as T
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Public client ─────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, headers?: Record<string, string>, signal?: AbortSignal) {
    return request<T>(path, { method: 'GET', headers, signal });
  },

  post<T>(path: string, body: unknown, headers?: Record<string, string>, signal?: AbortSignal) {
    return request<T>(path, { method: 'POST', body, headers, signal });
  },

  put<T>(path: string, body: unknown, headers?: Record<string, string>, signal?: AbortSignal) {
    return request<T>(path, { method: 'PUT', body, headers, signal });
  },

  patch<T>(path: string, body: unknown, headers?: Record<string, string>, signal?: AbortSignal) {
    return request<T>(path, { method: 'PATCH', body, headers, signal });
  },

  delete<T>(path: string, headers?: Record<string, string>, signal?: AbortSignal) {
    return request<T>(path, { method: 'DELETE', headers, signal });
  },
};
