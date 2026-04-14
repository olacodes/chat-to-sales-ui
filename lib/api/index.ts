/**
 * ChatToSales — Domain API
 *
 * All typed endpoint wrappers go here. Import from this module in pages/components,
 * never call apiClient directly from UI code.
 *
 * Usage:
 *   import { healthApi, webhookApi } from '@/lib/api';
 *
 *   const status = await healthApi.check();
 *   await webhookApi.trigger({ event: 'order.paid', payload: { id: '123' } });
 */

import { apiClient } from './client';

// Re-export the full service layer for convenience
export * from './endpoints';
export * from './services';
export * from './types';

// ─── /health ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  timestamp: string;
}

export const healthApi = {
  /**
   * GET /health
   * Returns the current health status of the backend.
   */
  check(signal?: AbortSignal): Promise<HealthResponse> {
    return apiClient.get<HealthResponse>('/health', undefined, signal);
  },
};

// ─── /webhook ─────────────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'order.created'
  | 'order.updated'
  | 'order.paid'
  | 'order.cancelled'
  | 'conversation.started'
  | 'conversation.closed'
  | 'payment.received'
  | 'payment.failed';

export interface WebhookPayload {
  event: WebhookEvent;
  payload: Record<string, unknown>;
}

export interface WebhookResponse {
  received: true;
  id: string;
  timestamp: string;
}

export const webhookApi = {
  /**
   * POST /webhook
   * Triggers a webhook event — useful for local integration testing.
   */
  trigger(body: WebhookPayload, signal?: AbortSignal): Promise<WebhookResponse> {
    return apiClient.post<WebhookResponse>('/webhook', body, undefined, signal);
  },
};
