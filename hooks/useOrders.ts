/**
 * React Query hooks for the Orders domain.
 *
 * Hooks:
 *   useOrders()          — fetch the full order list
 *   useConfirmOrder()    — mutation: pending → confirmed
 *   usePayOrder()        — mutation: confirmed → paid
 *   useCompleteOrder()   — mutation: paid → completed
 *
 * All mutations apply an optimistic update to the cached list and roll back
 * on error. They invalidate the full orders query on settle.
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/endpoints/orders';
import type { Order } from '@/store';
import type { CreateOrderPayload } from '@/lib/api/types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
} as const;

// ─── useOrders ────────────────────────────────────────────────────────────────

/**
 * Fetch all orders for the active tenant.
 *
 * @example
 * const { data: orders = [], isLoading, isError } = useOrders();
 */
export function useOrders() {
  return useQuery<Order[], Error>({
    queryKey: orderKeys.list(),
    queryFn: ({ signal }) => ordersApi.list(signal),
    staleTime: 30_000,
  });
}

// ─── Shared optimistic-update helper ─────────────────────────────────────────

type MutationContext = { previous: Order[] | undefined };

function buildActionMutation(
  action: 'confirm' | 'pay' | 'complete',
  optimisticStatus: Order['status'],
) {
  return function useActionMutation() {
    const qc = useQueryClient();

    return useMutation<Order, Error, string, MutationContext>({
      mutationFn: (id: string) =>
        action === 'confirm'
          ? ordersApi.confirm(id)
          : action === 'pay'
            ? ordersApi.pay(id)
            : ordersApi.complete(id),

      onMutate: async (id) => {
        // Cancel any in-flight refetches so they don't overwrite our optimistic update
        await qc.cancelQueries({ queryKey: orderKeys.list() });

        const previous = qc.getQueryData<Order[]>(orderKeys.list());

        qc.setQueryData<Order[]>(orderKeys.list(), (old) =>
          old?.map((o) => (o.id === id ? { ...o, status: optimisticStatus } : o)) ?? [],
        );

        return { previous };
      },

      onError: (_err, _id, context) => {
        if (context?.previous !== undefined) {
          qc.setQueryData(orderKeys.list(), context.previous);
        }
      },

      onSettled: () => {
        qc.invalidateQueries({ queryKey: orderKeys.all });
      },
    });
  };
}

// ─── Exported hooks ────────────────────────────────────────────────────────────

export const useConfirmOrder = buildActionMutation('confirm', 'confirmed');
export const usePayOrder = buildActionMutation('pay', 'paid');
export const useCompleteOrder = buildActionMutation('complete', 'completed');

// ─── useCreateOrder ────────────────────────────────────────────────────────────

export function useCreateAndConfirmOrder() {
  const qc = useQueryClient();
  return useMutation<Order, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const newOrder = await ordersApi.create(payload);
      return ordersApi.confirm(newOrder.id);
    },
    onSuccess: (confirmedOrder) => {
      qc.setQueryData<Order[]>(orderKeys.list(), (old) =>
        old ? [confirmedOrder, ...old] : [confirmedOrder],
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
