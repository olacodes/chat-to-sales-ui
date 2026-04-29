/**
 * Store endpoint — public, no auth or tenant_id required.
 *
 * Bypasses apiClient intentionally: the store page is unauthenticated and
 * must not inject Authorization headers or tenant_id query params.
 */

import { BASE_URL } from '../config';
import type { TraderStoreOut } from '../types';

export const storeApi = {
  async get(slug: string, signal?: AbortSignal): Promise<TraderStoreOut> {
    const res = await fetch(
      `${BASE_URL}/api/v1/store/${encodeURIComponent(slug)}`,
      { signal },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { detail?: string }).detail ?? `Store not found: ${slug}`);
    }
    return res.json() as Promise<TraderStoreOut>;
  },
};
