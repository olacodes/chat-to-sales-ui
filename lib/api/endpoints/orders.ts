/**
 * Orders endpoint
 *
 * Features:
 * - tenant_id injected automatically by the base client
 * - total_amount / total fallback with computed-from-items safety net
 * - Normalised status map handles legacy backend values
 */

import { apiClient } from '../client';
import type { OrderOut, CreateOrderPayload } from '../types';
import type { Order, OrderItem } from '@/store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUS_MAP: Record<string, import('@/store').OrderStatus> = {
  inquiry: 'inquiry',
  pending: 'pending',
  confirmed: 'confirmed',
  paid: 'paid',
  completed: 'completed',
  cancelled: 'cancelled',
  // Legacy / unexpected backend values
  shipped: 'paid',
  delivered: 'completed',
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapOrder(o: OrderOut): Order {
  const mappedItems = (o.items ?? []).map(
    (i): OrderItem => ({
      productId: i.product_id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
    }),
  );
  return {
    id: o.id,
    conversationId: o.conversation_id ?? null,
    customerId: o.customer_id ?? '',
    customerName: o.customer_name ?? '',
    status: ORDER_STATUS_MAP[o.state] ?? 'pending',
    items: mappedItems,
    itemCount: o.item_count ?? mappedItems.length,
    total: o.amount ?? 0,
    currency: o.currency,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

const BASE = '/api/v1';

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const ordersApi = {
  /** GET /api/v1/orders — tenant_id injected automatically.
   *  Handles flat array or offset-paginated envelope { items, total, limit, offset }. */
  list(signal?: AbortSignal): Promise<Order[]> {
    return apiClient
      .get<OrderOut[] | { items: OrderOut[]; total: number; limit: number; offset: number }>(
        `${BASE}/orders`,
        undefined,
        signal,
      )
      .then((response) => {
        const raw = Array.isArray(response) ? response : (response.items ?? []);
        return raw.map(mapOrder);
      });
  },

  /** GET /api/v1/orders/{id} — tenant_id injected automatically for isolation */
  get(id: string, signal?: AbortSignal): Promise<Order> {
    return apiClient
      .get<OrderOut>(`${BASE}/orders/${encodeURIComponent(id)}`, undefined, signal)
      .then(mapOrder);
  },

  /** POST /api/v1/orders */
  create(payload: CreateOrderPayload, signal?: AbortSignal): Promise<Order> {
    return apiClient
      .post<OrderOut>(`${BASE}/orders`, payload, undefined, signal)
      .then(mapOrder);
  },

  /** POST /api/v1/orders/{id}/confirm */
  confirm(id: string, signal?: AbortSignal): Promise<Order> {
    return apiClient
      .post<OrderOut>(`${BASE}/orders/${encodeURIComponent(id)}/confirm`, {}, undefined, signal)
      .then(mapOrder);
  },

  /** POST /api/v1/orders/{id}/pay */
  pay(id: string, signal?: AbortSignal): Promise<Order> {
    return apiClient
      .post<OrderOut>(`${BASE}/orders/${encodeURIComponent(id)}/pay`, {}, undefined, signal)
      .then(mapOrder);
  },

  /** POST /api/v1/orders/{id}/complete */
  complete(id: string, signal?: AbortSignal): Promise<Order> {
    return apiClient
      .post<OrderOut>(`${BASE}/orders/${encodeURIComponent(id)}/complete`, {}, undefined, signal)
      .then(mapOrder);
  },
};
