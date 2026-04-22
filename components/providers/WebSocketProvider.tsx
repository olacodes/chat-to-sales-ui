'use client';

import { useEffect } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { wsConnection } from '@/lib/websocket/connection';
import { conversationKeys } from '@/hooks/useConversations';
import { orderKeys } from '@/hooks/useOrders';
import { paymentKeys } from '@/hooks/usePayments';
import { dashboardKeys } from '@/hooks/useDashboard';
import type {
  MessageReceivedPayload,
  OrderStateChangedPayload,
  PaymentConfirmedPayload,
  ConversationCreatedPayload,
  ConversationUpdatedPayload,
} from '@/lib/websocket/events';
import type { Conversation, Message, Order, Payment } from '@/store';
import type { PagedOut } from '@/lib/api/types';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const isDev = process.env.NODE_ENV !== 'production';

function log(event: string, detail?: unknown) {
  if (isDev) console.debug(`[ws:cache] ${event}`, detail ?? '');
}

/** Shared helper: surgically patch a conversation in every relevant cache. */
function patchConversation(
  qc: ReturnType<typeof import('@tanstack/react-query').useQueryClient>,
  p: ConversationUpdatedPayload,
) {
  const domainStatus: Conversation['status'] | undefined =
    p.status === 'closed' ? 'resolved' : p.status;

  const applyPatch = (c: Conversation): Conversation => {
    if (c.id !== p.id) return c;
    return {
      ...c,
      ...(domainStatus !== undefined && { status: domainStatus }),
      ...(p.last_message !== undefined && { lastMessage: p.last_message }),
      lastMessageAt: p.updated_at,
    };
  };

  qc.setQueriesData<InfiniteData<PagedOut<Conversation>>>(
    { queryKey: conversationKeys.lists() },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map(applyPatch),
        })),
      };
    },
  );

  qc.setQueryData<Conversation>(conversationKeys.detail(p.id), (old) =>
    old ? applyPatch(old) : old,
  );
}

/**
 * Owns the WebSocket lifecycle and applies real-time events directly
 * into the React Query cache — no refetch, no Zustand.
 *
 * Handled events:
 *   message.received     → append to messages cache, update conversation list
 *   order.updated        → patch order in list + detail caches
 *   order.created        → invalidate orders list (new row, unknown position)
 *   payment.confirmed    → patch payment to 'paid', invalidate dashboard
 *   conversation.started → invalidate conversations list
 *   conversation.closed  → patch conversation status to 'resolved'
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId) ?? '';

  useEffect(() => {
    wsConnection.connect(tenantId);
    if (isDev) console.debug(`[ws] connecting for tenant="${tenantId}"`);

    // ── message.received ──────────────────────────────────────────────────────
    const unsubMessage = wsConnection.onMessage<MessageReceivedPayload>(
      'message.received',
      (msg) => {
        const p = msg.payload;
        // Normalize: backend may emit snake_case fields (conversation_id,
        // created_at) or camelCase (conversationId, timestamp) depending on
        // the serialization config. Handle both to stay resilient.
        const conversationId = (p.conversationId ?? p.conversation_id) as string;
        const timestamp = (p.timestamp ?? p.created_at) as string;

        log('message.received', { id: p.id, conversationId });

        const message: Message = {
          id: p.id,
          conversationId,
          role: p.sender_role,
          senderIdentifier: p.sender_identifier ?? null,
          content: p.content,
          timestamp,
        };

        // Append to messages infinite query. If the messages cache doesn't
        // exist yet for this conversation, create a seed page so the message
        // is visible immediately when the user opens the conversation.
        qc.setQueryData<InfiniteData<PagedOut<Message>>>(
          conversationKeys.messages(conversationId),
          (old) => {
            if (!old?.pages?.length) {
              return { pages: [{ items: [message], next_cursor: null }], pageParams: [undefined] };
            }
            const pages = [...old.pages];
            const last = pages.length - 1;
            pages[last] = { ...pages[last], items: [...pages[last].items, message] };
            return { ...old, pages };
          },
        );

        // Update lastMessage + unreadCount across all paginated conversation lists.
        // If the conversation isn't found fall back to a full invalidation.
        let foundInList = false;
        qc.setQueriesData<InfiniteData<PagedOut<Conversation>>>(
          { queryKey: conversationKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.map((c) => {
                  if (c.id !== conversationId) return c;
                  foundInList = true;
                  return {
                    ...c,
                    lastMessage: p.content,
                    lastMessageAt: timestamp,
                    unreadCount: c.unreadCount + 1,
                  };
                }),
              })),
            };
          },
        );

        if (!foundInList) {
          log('message.received — conversation not in cache, invalidating list');
          qc.invalidateQueries({ queryKey: conversationKeys.lists() });
        }

        // Patch conversation detail if it's already in cache
        qc.setQueryData<Conversation>(conversationKeys.detail(conversationId), (old) =>
          old
            ? {
                ...old,
                lastMessage: p.content,
                lastMessageAt: timestamp,
                messages: [...old.messages, message],
              }
            : old,
        );
      },
    );

    // ── order.updated ─────────────────────────────────────────────────────────
    const unsubOrderUpdated = wsConnection.onMessage<OrderStateChangedPayload>(
      'order.updated',
      (msg) => {
        const p = msg.payload;
        log('order.updated', { id: p.orderId, status: p.status });

        // Patch in list cache
        qc.setQueryData<Order[]>(
          orderKeys.list(),
          (old) =>
            old?.map((o) =>
              o.id === p.orderId ? { ...o, status: p.status, updatedAt: p.updatedAt } : o,
            ) ?? [],
        );

        // Patch detail cache if present
        qc.setQueryData<Order>(orderKeys.detail(p.orderId), (old) =>
          old ? { ...old, status: p.status, updatedAt: p.updatedAt } : old,
        );
      },
    );

    // ── order.created ─────────────────────────────────────────────────────────
    // We don't know the full order shape from the event, so invalidate to refetch
    const unsubOrderCreated = wsConnection.onMessage<OrderStateChangedPayload>(
      'order.created',
      (msg) => {
        log('order.created', { id: msg.payload.orderId });
        qc.invalidateQueries({ queryKey: orderKeys.lists() });
      },
    );

    // ── payment.confirmed ─────────────────────────────────────────────────────
    const unsubPaymentConfirmed = wsConnection.onMessage<PaymentConfirmedPayload>(
      'payment.confirmed',
      (msg) => {
        const p = msg.payload;
        log('payment.confirmed', { id: p.paymentId, orderId: p.orderId });

        // Patch payment to 'paid' in list cache
        qc.setQueryData<Payment[]>(
          paymentKeys.list(),
          (old) =>
            old?.map((pay) =>
              pay.id === p.paymentId ? { ...pay, status: 'paid' as const, paidAt: p.paidAt } : pay,
            ) ?? [],
        );

        // Patch payment detail cache if present
        qc.setQueryData<Payment>(paymentKeys.detail(p.paymentId), (old) =>
          old ? { ...old, status: 'paid' as const, paidAt: p.paidAt } : old,
        );

        // Also patch the related order status in list cache
        qc.setQueryData<Order[]>(
          orderKeys.list(),
          (old) =>
            old?.map((o) =>
              o.id === p.orderId ? { ...o, status: 'paid' as const, updatedAt: p.paidAt } : o,
            ) ?? [],
        );

        // Revenue changed — mark dashboard metrics stale
        qc.invalidateQueries({ queryKey: dashboardKeys.overview() });
      },
    );

    // ── conversation.started (new conversation created) ─────────────────────────────
    const unsubConvStarted = wsConnection.onMessage<ConversationCreatedPayload>(
      'conversation.started',
      (msg) => {
        const p = msg.payload;
        log('conversation.started', { id: p.id, identifier: p.customer_identifier });

        const domainStatus: Conversation['status'] = p.status === 'closed' ? 'resolved' : p.status;

        const newConv: Conversation = {
          id: p.id,
          customerIdentifier: p.customer_identifier,
          customerName: p.customer_name ?? p.customer_identifier,
          status: domainStatus,
          lastMessage: null,
          lastMessageAt: p.created_at,
          unreadCount: 0,
          messages: [],
        };

        // Try surgical prepend into every cached conversation list.
        // Track whether any cached list was actually updated.
        let updatedCache = false;
        qc.setQueriesData<InfiniteData<PagedOut<Conversation>>>(
          { queryKey: conversationKeys.lists() },
          (old) => {
            if (!old) return old;
            updatedCache = true;
            const pages = [...old.pages];
            pages[0] = { ...pages[0], items: [newConv, ...pages[0].items] };
            return { ...old, pages };
          },
        );

        // If the cache was cold (user hasn't loaded the list yet), fall back to
        // a full invalidation so the next render fetches fresh data.
        if (!updatedCache) {
          log('conversation.started — cache cold, invalidating');
          qc.invalidateQueries({ queryKey: conversationKeys.lists() });
        }
      },
    );

    // ── conversation.updated ────────────────────────────────────────────────────────────
    const unsubConvUpdated = wsConnection.onMessage<ConversationUpdatedPayload>(
      'conversation.updated',
      (msg) => {
        const p = msg.payload;
        log('conversation.updated', { id: p.id, status: p.status });
        patchConversation(qc, p);
      },
    );

    // ── conversation.closed ───────────────────────────────────────────────────
    const unsubConvClosed = wsConnection.onMessage<ConversationUpdatedPayload>(
      'conversation.closed',
      (msg) => {
        const p = msg.payload;
        log('conversation.closed', p.id);
        // Treat the same as conversation.updated — marks status + patches last message
        patchConversation(qc, { ...p, status: p.status ?? 'closed' });
      },
    );

    return () => {
      unsubMessage();
      unsubOrderUpdated();
      unsubOrderCreated();
      unsubPaymentConfirmed();
      unsubConvStarted();
      unsubConvUpdated();
      unsubConvClosed();
      wsConnection.disconnect();
    };
  }, [tenantId, qc]);

  return <>{children}</>;
}
