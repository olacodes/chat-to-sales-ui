/**
 * Dashboard endpoint
 *
 * Three endpoints, tried in order of preference:
 *   1. GET /api/v1/dashboard/overview  (preferred)
 *   2. GET /api/v1/dashboard/metrics
 *   3. GET /api/v1/dashboard           (legacy)
 *
 * tenant_id is injected automatically by the base client.
 */

import { apiClient } from '../client';
import type {
  DashboardOverviewOut,
  DashboardMetricsOut,
  RecentActivityItemOut,
  RecentActivityOut,
} from '../types';

// ─── Domain types (camelCase, used in UI) ────────────────────────────────────

export interface DashboardOverview {
  totalOrders: number;
  totalRevenue: number;
  currency: string;
  activeConversations: number;
  conversionRate: number;
  pendingOrders: number;
  completedOrders: number;
}

export type ActivityKind = 'order' | 'payment' | 'conversation' | 'message' | 'generic';

export interface DashboardActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  amount?: number;
  currency?: string;
  status?: string;
  timestamp: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapOverview(raw: DashboardOverviewOut): DashboardOverview {
  // /overview wraps metrics under a nested `metrics` key;
  // /metrics returns them flat — handle both
  const d = raw.metrics ?? raw;
  return {
    totalOrders: d.total_orders ?? 0,
    totalRevenue: Number(d.total_revenue ?? d.revenue ?? 0),
    currency: d.currency ?? 'USD',
    activeConversations: d.active_conversations ?? d.open_conversations ?? 0,
    conversionRate: d.conversion_rate ?? 0,
    pendingOrders: d.pending_orders ?? 0,
    completedOrders: d.completed_orders ?? 0,
  };
}

function resolveKind(item: RecentActivityItemOut): ActivityKind {
  const raw = (item.type ?? item.event_type ?? item.kind ?? '').toLowerCase();
  if (raw.includes('order')) return 'order';
  if (raw.includes('pay')) return 'payment';
  if (raw.includes('conv')) return 'conversation';
  if (raw.includes('message') || raw.includes('msg')) return 'message';
  return 'generic';
}

function mapActivityItem(item: RecentActivityItemOut): DashboardActivityItem {
  const kind = resolveKind(item);
  const nested = item.data ?? {};

  // Build human-readable title from whatever fields are available
  const title =
    item.title ??
    item.content ??
    item.description ??
    (kind === 'order'
      ? `Order${item.customer_name ? ` — ${item.customer_name}` : ''}`
      : kind === 'payment'
        ? `Payment${item.reference ? ` · ${item.reference}` : ''}`
        : kind === 'conversation'
          ? `Conversation${item.customer_name ? ` with ${item.customer_name}` : ''}`
          : kind === 'message'
            ? 'New message'
            : 'Activity');

  const subtitle =
    item.order_id
      ? `Order ${item.order_id}`
      : (nested['order_id'] as string | undefined)
        ? `Order ${nested['order_id']}`
        : '';

  // Generate a stable id when the backend omits it
  const id = item.id ?? `${kind}-${item.timestamp ?? item.created_at ?? Math.random().toString(36).slice(2)}`;

  return {
    id,
    kind,
    title,
    subtitle,
    amount: item.amount != null ? Number(item.amount) : (nested['amount'] != null ? Number(nested['amount']) : undefined),
    currency: item.currency ?? (nested['currency'] as string | undefined),
    status: item.status ?? item.state ?? (nested['status'] as string | undefined),
    timestamp: item.created_at ?? item.timestamp ?? item.updated_at ?? new Date().toISOString(),
  };
}

function extractItems(response: RecentActivityOut | RecentActivityItemOut[]): RecentActivityItemOut[] {
  if (Array.isArray(response)) return response;
  if (response.items && Array.isArray(response.items)) return response.items;
  if (response.activities && Array.isArray(response.activities)) return response.activities;
  return [];
}

const BASE = '/api/v1';

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * GET /api/v1/dashboard/overview — preferred metrics endpoint.
   * Falls back to /api/v1/dashboard/metrics, then /api/v1/dashboard.
   */
  getOverview(signal?: AbortSignal): Promise<DashboardOverview> {
    return apiClient
      .get<DashboardOverviewOut>(`${BASE}/dashboard/overview`, undefined, signal)
      .then(mapOverview);
  },

  /** GET /api/v1/dashboard/metrics */
  getMetrics(signal?: AbortSignal): Promise<DashboardOverview> {
    return apiClient
      .get<DashboardMetricsOut>(`${BASE}/dashboard/metrics`, undefined, signal)
      .then(mapOverview);
  },

  /**
   * GET /api/v1/dashboard — legacy summary endpoint.
   * @deprecated Prefer getOverview()
   */
  getSummary(signal?: AbortSignal): Promise<DashboardOverview> {
    return apiClient
      .get<DashboardOverviewOut>(`${BASE}/dashboard`, undefined, signal)
      .then(mapOverview);
  },

  /**
   * GET /api/v1/dashboard/recent-activity
   * Handles both flat-array and envelope responses.
   */
  getRecentActivity(signal?: AbortSignal): Promise<DashboardActivityItem[]> {
    return apiClient
      .get<RecentActivityOut | RecentActivityItemOut[]>(
        `${BASE}/dashboard/recent-activity`,
        undefined,
        signal,
      )
      .then((response) => extractItems(response as RecentActivityOut).map(mapActivityItem));
  },
};
