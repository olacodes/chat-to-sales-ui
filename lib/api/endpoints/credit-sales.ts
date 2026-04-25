import { apiClient } from '../client';
import type {
  CreditSaleOut,
  CreditSaleListResponse,
  CreateCreditSalePayload,
  ReminderOut,
} from '../types';
import type { CreditSale, CreditSaleStatus } from '@/store';

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapCreditSale(c: CreditSaleOut): CreditSale {
  return {
    id: c.id,
    tenantId: c.tenant_id,
    orderId: c.order_id,
    conversationId: c.conversation_id,
    customerName: c.customer_name,
    amount: Number(c.amount),
    currency: c.currency,
    dueDate: c.due_date,
    status: c.status as CreditSaleStatus,
    reminderIntervalDays: c.reminder_interval_days,
    maxReminders: c.max_reminders,
    remindersSent: c.reminders_sent,
    lastRemindedAt: c.last_reminded_at,
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

const BASE = '/api/v1/credit-sales';

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const creditSalesApi = {
  list(status?: string, signal?: AbortSignal): Promise<CreditSale[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiClient
      .get<CreditSaleListResponse>(`${BASE}${qs}`, undefined, signal)
      .then((res) => res.items.map(mapCreditSale));
  },

  get(id: string, signal?: AbortSignal): Promise<CreditSale> {
    return apiClient
      .get<CreditSaleOut>(`${BASE}/${encodeURIComponent(id)}`, undefined, signal)
      .then(mapCreditSale);
  },

  create(payload: CreateCreditSalePayload, signal?: AbortSignal): Promise<CreditSale> {
    return apiClient
      .post<CreditSaleOut>(`${BASE}/`, payload, undefined, signal)
      .then(mapCreditSale);
  },

  settle(id: string, signal?: AbortSignal): Promise<CreditSale> {
    return apiClient
      .post<CreditSaleOut>(`${BASE}/${encodeURIComponent(id)}/settle`, {}, undefined, signal)
      .then(mapCreditSale);
  },

  dispute(id: string, signal?: AbortSignal): Promise<CreditSale> {
    return apiClient
      .post<CreditSaleOut>(`${BASE}/${encodeURIComponent(id)}/dispute`, {}, undefined, signal)
      .then(mapCreditSale);
  },

  writeOff(id: string, signal?: AbortSignal): Promise<CreditSale> {
    return apiClient
      .post<CreditSaleOut>(`${BASE}/${encodeURIComponent(id)}/write-off`, {}, undefined, signal)
      .then(mapCreditSale);
  },

  remind(id: string, signal?: AbortSignal): Promise<ReminderOut> {
    return apiClient.post<ReminderOut>(
      `${BASE}/${encodeURIComponent(id)}/remind`,
      {},
      undefined,
      signal,
    );
  },
};
