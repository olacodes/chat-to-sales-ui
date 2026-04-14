/**
 * React Query hooks for the Payments domain.
 *
 * Hooks:
 *   usePayments()   — fetch the full payment list
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/endpoints/payments';
import type { Payment } from '@/store';

// ─── Query key factory ────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: () => [...paymentKeys.lists()] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
} as const;

// ─── usePayments ──────────────────────────────────────────────────────────────

/**
 * Fetch all payments for the active tenant.
 *
 * @example
 * const { data: payments = [], isLoading, isError } = usePayments();
 */
export function usePayments() {
  return useQuery<Payment[], Error>({
    queryKey: paymentKeys.list(),
    queryFn: ({ signal }) => paymentsApi.list(signal),
    staleTime: 30_000,
  });
}
