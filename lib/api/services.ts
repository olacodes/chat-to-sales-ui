/**
 * ChatToSales — Backward-compatible service aliases
 *
 * Re-exports endpoint functions with the legacy signatures that existing
 * call-sites expect. The `tenantId` param accepted by `list()` methods is
 * no longer used — tenant injection now happens automatically in the base
 * client. New code should import directly from '@/lib/api/endpoints'.
 */

import { conversationsApi } from './endpoints/conversations';
import { ordersApi } from './endpoints/orders';
import { paymentsApi } from './endpoints/payments';
import { apiClient } from './client';
import type { InboundWebhookPayload } from './types';
import type { Conversation, Message, Order, Payment } from '@/store';

// Re-export endpoint objects so '@/lib/api/services' still works as a
// single entry point when callers prefer the new API names.
export { conversationsApi, ordersApi, paymentsApi } from './endpoints';
export { dashboardApi } from './endpoints/dashboard';

// ─── Conversation service (legacy alias) ─────────────────────────────────────────

export const conversationService = {
  /** tenantId accepted for backward compatibility — client auto-injects it */
  list: (_tenantId: string, signal?: AbortSignal): Promise<Conversation[]> =>
    conversationsApi.list(signal),
  get: (id: string, signal?: AbortSignal): Promise<Conversation> =>
    conversationsApi.get(id, signal),
  create: conversationsApi.create,
  addMessage: (conversationId: string, payload: Parameters<typeof conversationsApi.addMessage>[1], signal?: AbortSignal): Promise<Message> =>
    conversationsApi.addMessage(conversationId, payload, signal),
};

// ─── Order service (legacy alias) ───────────────────────────────────────────────

export const orderService = {
  /** tenantId accepted for backward compatibility — client auto-injects it */
  list: (_tenantId: string, signal?: AbortSignal): Promise<Order[]> =>
    ordersApi.list(signal),
  get: (id: string, signal?: AbortSignal): Promise<Order> =>
    ordersApi.get(id, signal),
  create: ordersApi.create,
  confirm: (id: string, signal?: AbortSignal): Promise<Order> =>
    ordersApi.confirm(id, signal),
  pay: (id: string, signal?: AbortSignal): Promise<Order> =>
    ordersApi.pay(id, signal),
  complete: (id: string, signal?: AbortSignal): Promise<Order> =>
    ordersApi.complete(id, signal),
};

// ─── Payment service (legacy alias) ─────────────────────────────────────────────

export const paymentService = {
  /** tenantId accepted for backward compatibility — client auto-injects it */
  list: (_tenantId: string, signal?: AbortSignal): Promise<Payment[]> =>
    paymentsApi.list(signal),
  get: (id: string, signal?: AbortSignal): Promise<Payment> =>
    paymentsApi.get(id, signal),
  initiate: paymentsApi.initiate,
};

// ─── Webhook service ─────────────────────────────────────────────────────────────────

const BASE = '/api/v1';

export const webhookService = {
  /**
   * POST /api/v1/webhooks/webhook
   *
   * Simulates an inbound message from a customer on an external channel
   * (WhatsApp, SMS, etc.). The backend processes the message, creates or
   * updates a conversation, and emits WebSocket events back to the frontend.
   */
  sendInboundMessage(payload: InboundWebhookPayload, signal?: AbortSignal): Promise<void> {
    return apiClient
      .post<unknown>(`${BASE}/webhooks/webhook`, payload, undefined, signal)
      .then(() => undefined);
  },
};
