'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creditSalesApi } from '@/lib/api/endpoints/credit-sales';
import type { CreditSale } from '@/store';
import type { CreateCreditSalePayload } from '@/lib/api/types';
import { orderKeys } from '@/hooks/useOrders';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const creditSaleKeys = {
  all: ['credit-sales'] as const,
  lists: () => [...creditSaleKeys.all, 'list'] as const,
  list: (status?: string) => [...creditSaleKeys.lists(), status ?? 'all'] as const,
  detail: (id: string) => [...creditSaleKeys.all, 'detail', id] as const,
};

// ─── useCreditSales ───────────────────────────────────────────────────────────

export function useCreditSales(status?: string) {
  return useQuery<CreditSale[], Error>({
    queryKey: creditSaleKeys.list(status),
    queryFn: ({ signal }) => creditSalesApi.list(status, signal),
    staleTime: 30_000,
  });
}

// ─── useCreateCreditSale ──────────────────────────────────────────────────────

export function useCreateCreditSale() {
  const qc = useQueryClient();
  return useMutation<CreditSale, Error, CreateCreditSalePayload>({
    mutationFn: (payload) => creditSalesApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creditSaleKeys.lists() });
    },
  });
}

// ─── useSettleCreditSale ──────────────────────────────────────────────────────

export function useSettleCreditSale() {
  const qc = useQueryClient();
  return useMutation<CreditSale, Error, string>({
    mutationFn: (id) => creditSalesApi.settle(id),
    onSuccess: (updated) => {
      qc.setQueriesData<CreditSale[]>(
        { queryKey: creditSaleKeys.lists() },
        (old) => old?.map((c) => (c.id === updated.id ? updated : c)),
      );
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// ─── useDisputeCreditSale ─────────────────────────────────────────────────────

export function useDisputeCreditSale() {
  const qc = useQueryClient();
  return useMutation<CreditSale, Error, string>({
    mutationFn: (id) => creditSalesApi.dispute(id),
    onSuccess: (updated) => {
      qc.setQueriesData<CreditSale[]>(
        { queryKey: creditSaleKeys.lists() },
        (old) => old?.map((c) => (c.id === updated.id ? updated : c)),
      );
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// ─── useWriteOffCreditSale ────────────────────────────────────────────────────

export function useWriteOffCreditSale() {
  const qc = useQueryClient();
  return useMutation<CreditSale, Error, string>({
    mutationFn: (id) => creditSalesApi.writeOff(id),
    onSuccess: (updated) => {
      qc.setQueriesData<CreditSale[]>(
        { queryKey: creditSaleKeys.lists() },
        (old) => old?.map((c) => (c.id === updated.id ? updated : c)),
      );
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// ─── useSendCreditReminder ────────────────────────────────────────────────────

export function useSendCreditReminder() {
  const qc = useQueryClient();
  return useMutation<{ creditSaleId: string; remindersSent: number }, Error, string>({
    mutationFn: async (id) => {
      const res = await creditSalesApi.remind(id);
      return { creditSaleId: id, remindersSent: res.reminders_sent };
    },
    onSuccess: ({ creditSaleId, remindersSent }) => {
      // Patch reminders_sent in list caches without a full refetch
      qc.setQueriesData<CreditSale[]>(
        { queryKey: creditSaleKeys.lists() },
        (old) =>
          old?.map((c) =>
            c.id === creditSaleId ? { ...c, remindersSent } : c,
          ),
      );
    },
  });
}
