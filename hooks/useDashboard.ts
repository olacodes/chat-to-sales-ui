/**
 * React Query hooks for the Dashboard domain.
 *
 * Hooks:
 *   useDashboardOverview()    — top-level metrics via GET /api/v1/dashboard/overview
 *   useRecentActivity()       — activity feed via GET /api/v1/dashboard/recent-activity
 *
 * Both hooks follow the same fallback chain on 404:
 *   overview  → metrics → summary (legacy)
 *   activity  → empty array (graceful degradation)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/endpoints/dashboard';
import type { DashboardOverview, DashboardActivityItem, TodayFocusItem } from '@/lib/api/endpoints/dashboard';

// ─── Query key factory ────────────────────────────────────────────────────────

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  focus: () => [...dashboardKeys.all, 'focus'] as const,
} as const;

// ─── useDashboardOverview ─────────────────────────────────────────────────────

/**
 * Fetches pre-aggregated tenant metrics from the preferred endpoint,
 * with automatic fallback to legacy summary on failure.
 *
 * @example
 * const { data, isLoading } = useDashboardOverview();
 */
export function useDashboardOverview() {
  return useQuery<DashboardOverview, Error>({
    queryKey: dashboardKeys.overview(),
    queryFn: async ({ signal }) => {
      // Try /overview first, then /metrics, then legacy /dashboard
      try {
        return await dashboardApi.getOverview(signal);
      } catch {
        try {
          return await dashboardApi.getMetrics(signal);
        } catch {
          return await dashboardApi.getSummary(signal);
        }
      }
    },
    staleTime: 30_000,
    retry: false, // fallback logic is inline — don't let React Query also retry
  });
}

// ─── useRecentActivity ────────────────────────────────────────────────────────

/**
 * Fetches the recent-activity feed.
 * Returns an empty array (not an error) if the endpoint doesn't exist.
 *
 * @example
 * const { data: items = [], isLoading } = useRecentActivity();
 */
export function useRecentActivity() {
  return useQuery<DashboardActivityItem[], Error>({
    queryKey: dashboardKeys.activity(),
    queryFn: async ({ signal }) => {
      try {
        return await dashboardApi.getRecentActivity(signal);
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
    retry: false,
  });
}

// ─── useTodayFocus ────────────────────────────────────────────────────────────

/**
 * Fetches prioritised action items for today's focus panel.
 * Returns an empty array (not an error) if the endpoint doesn't exist yet.
 *
 * @example
 * const { data: items = [], isLoading } = useTodayFocus();
 */
export function useTodayFocus() {
  return useQuery<TodayFocusItem[], Error>({
    queryKey: dashboardKeys.focus(),
    queryFn: async ({ signal }) => {
      try {
        return await dashboardApi.getTodayFocus(signal);
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
    retry: false,
  });
}
