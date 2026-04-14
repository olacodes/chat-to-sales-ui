/**
 * Payments endpoint
 *
 * tenant_id is injected automatically by the base client.
 */

import { apiClient } from '../client';
import type { PaymentOut, InitiatePaymentPayload } from '../types';
import type { Payment } from '@/store';

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapPayment(p: PaymentOut): Payment {
  return {
    id: p.id,
    orderId: p.order_id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method ?? 'Unknown',
    reference: p.reference,
    paymentLink: p.payment_link,
    paidAt: p.paid_at,
    createdAt: p.created_at,
  };
}

const BASE = '/api/v1';

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  /** GET /api/v1/payments — tenant_id injected automatically.
   *  Handles both a flat array and an offset-paginated envelope { items, total, limit, offset }. */
  list(signal?: AbortSignal): Promise<Payment[]> {
    return apiClient
      .get<
        | PaymentOut[]
        | { items: PaymentOut[]; total: number; limit: number; offset: number }
      >(`${BASE}/payments`, undefined, signal)
      .then((response) => {
        const raw = Array.isArray(response) ? response : (response.items ?? []);
        return raw.map(mapPayment);
      });
  },

  /** GET /api/v1/payments/{id} */
  get(id: string, signal?: AbortSignal): Promise<Payment> {
    return apiClient
      .get<PaymentOut>(`${BASE}/payments/${encodeURIComponent(id)}`, undefined, signal)
      .then(mapPayment);
  },

  /** POST /api/v1/payments */
  initiate(payload: InitiatePaymentPayload, signal?: AbortSignal): Promise<Payment> {
    return apiClient
      .post<PaymentOut>(`${BASE}/payments`, payload, undefined, signal)
      .then(mapPayment);
  },
};
