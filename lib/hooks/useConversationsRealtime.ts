'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { wsConnection } from '@/lib/websocket/connection';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import { useAppStore } from '@/store';
import { conversationKeys } from '@/hooks/useConversations';
import type {
  MessageReceivedPayload,
  OrderStateChangedPayload,
  PaymentConfirmedPayload,
  ConversationCreatedPayload,
} from '@/lib/websocket/events';
import type { PagedOut } from '@/lib/api/types';
import type { Message } from '@/store';

export interface RealtimeActivity {
  type: 'message.received' | 'order.updated' | 'payment.confirmed' | 'conversation.started';
  label: string;
  at: number; // Date.now()
}

interface UseConversationsRealtimeReturn {
  status: ReturnType<typeof useWsStatus>;
  /** Most recent real-time event — useful for flashing a toast */
  lastActivity: RealtimeActivity | null;
  /** Clear the last activity (e.g. after a toast times out) */
  clearActivity: () => void;
}

/** Produces a React Query setQueryData updater that appends a new message. */
function makeMessageUpdater(newMsg: Message) {
  return (old: InfiniteData<PagedOut<Message>> | undefined): InfiniteData<PagedOut<Message>> => {
    if (!old) {
      return { pages: [{ items: [newMsg], next_cursor: null }], pageParams: [undefined] };
    }
    const lastIdx = old.pages.length - 1;
    const pages = old.pages.map((page, idx) =>
      idx === lastIdx ? { ...page, items: [...page.items, newMsg] } : page,
    );
    return { ...old, pages };
  };
}

/**
 * Page-level hook for the Conversations screen.
 *
 * Subscribes to backend WebSocket events and routes them into the
 * React Query cache (messages) and Zustand store (orders/payments).
 * Also returns reactive connection status and last-activity info for
 * in-page UI feedback.
 */
export function useConversationsRealtime(): UseConversationsRealtimeReturn {
  const status = useWsStatus();
  const [lastActivity, setLastActivity] = useState<RealtimeActivity | null>(null);
  const queryClient = useQueryClient();

  // Orders and payments still live in Zustand
  const updateOrder = useAppStore((s) => s.updateOrder);
  const updatePayment = useAppStore((s) => s.updatePayment);

  const clearActivity = useCallback(() => setLastActivity(null), []);

  useEffect(() => {
    // ── message.received ───────────────────────────────────────────────────
    const unsubMessage = wsConnection.onMessage<MessageReceivedPayload>(
      'message.received',
      (msg) => {
        const { id, conversationId, sender_role, sender_identifier, content, timestamp } =
          msg.payload;

        const newMsg: Message = {
          id,
          conversationId,
          role: sender_role,
          senderIdentifier: sender_identifier ?? null,
          content,
          timestamp,
        };

        // Update the React Query message cache so ChatWindow reflects the new
        // message without a refresh.
        const messagesKey = conversationKeys.messages(conversationId);
        queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(
          messagesKey,
          makeMessageUpdater(newMsg),
        );

        // Refresh the conversation list so the last-message preview updates,
        // and so a brand-new conversation becomes visible immediately.
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });

        setLastActivity({
          type: 'message.received',
          label: `New message`,
          at: Date.now(),
        });
      },
    );

    // ── order.updated ──────────────────────────────────────────────────────
    const unsubOrder = wsConnection.onMessage<OrderStateChangedPayload>('order.updated', (msg) => {
      const { orderId, status: orderStatus, updatedAt } = msg.payload;
      updateOrder(orderId, { status: orderStatus, updatedAt });

      setLastActivity({
        type: 'order.updated',
        label: `Order ${orderId} → ${orderStatus}`,
        at: Date.now(),
      });
    });

    // ── payment.confirmed ──────────────────────────────────────────────────
    const unsubPayment = wsConnection.onMessage<PaymentConfirmedPayload>(
      'payment.confirmed',
      (msg) => {
        const { paymentId, paidAt } = msg.payload;
        updatePayment(paymentId, { status: 'paid', paidAt });

        setLastActivity({
          type: 'payment.confirmed',
          label: `Payment confirmed`,
          at: Date.now(),
        });
      },
    );

    // ── conversation.started ───────────────────────────────────────────────
    const unsubConversation = wsConnection.onMessage<ConversationCreatedPayload>(
      'conversation.started',
      (_msg) => {
        // A new conversation was created (e.g. first WhatsApp message from a
        // new customer). Invalidate the list so it appears in the sidebar.
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });

        setLastActivity({
          type: 'conversation.started',
          label: `New conversation started`,
          at: Date.now(),
        });
      },
    );

    return () => {
      unsubMessage();
      unsubOrder();
      unsubPayment();
      unsubConversation();
    };
  }, [queryClient, updateOrder, updatePayment]);

  return { status, lastActivity, clearActivity };
}
