'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { wsConnection } from '@/lib/websocket/connection';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import { useAppStore } from '@/store';
import { conversationKeys } from '@/hooks/useConversations';
import type {
  ConversationMessageSavedPayload,
  MessageReactionUpdatedPayload,
  OrderStateChangedPayload,
  PaymentConfirmedPayload,
  ConversationCreatedPayload,
} from '@/lib/websocket/events';
import type { PagedOut } from '@/lib/api/types';
import type { Message, Reaction } from '@/store';

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
  const incrementUnread = useAppStore((s) => s.incrementUnread);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const clearActivity = useCallback(() => setLastActivity(null), []);

  useEffect(() => {
    // ── conversation.message_saved ─────────────────────────────────────────
    // Fires AFTER the message has been committed to the database, so it is
    // safe to invalidate API queries here without hitting a race condition.
    const unsubMessage = wsConnection.onMessage<ConversationMessageSavedPayload>(
      'conversation.message_saved',
      (msg) => {
        const p = msg.payload;

        const newMsg: Message = {
          id: p.id,
          conversationId: p.conversation_id,
          role: p.sender_role,
          senderIdentifier: p.sender_identifier ?? null,
          content: p.content,
          timestamp: p.created_at ?? msg.timestamp ?? new Date().toISOString(),
          reactions: [],
        };

        // Append the new message directly into the cache so the chat window
        // updates instantly without waiting for a refetch.
        const messagesKey = conversationKeys.messages(p.conversation_id);
        queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(
          messagesKey,
          makeMessageUpdater(newMsg),
        );

        // Refresh the conversation list so the last-message preview updates,
        // and so a brand-new conversation becomes visible immediately.
        // Safe to do here because the DB write has already committed.
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });

        // Increment the unread badge only for conversations the user is not
        // currently viewing. The active conversation is considered "read".
        if (p.conversation_id !== activeConversationId) {
          incrementUnread(p.conversation_id);
        }

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

    // ── message.reaction_updated ───────────────────────────────────────────
    // Fires after a reaction is toggled. Patches the message in the RQ cache
    // with the authoritative reaction list from the server so all clients
    // (including the one that triggered the change) stay in sync.
    const unsubReaction = wsConnection.onMessage<MessageReactionUpdatedPayload>(
      'message.reaction_updated',
      (msg) => {
        const { conversation_id, message_id, reactions } = msg.payload;
        const messagesKey = conversationKeys.messages(conversation_id);

        const mappedReactions: Reaction[] = reactions.map((r) => ({
          id: r.id,
          userId: r.user_id,
          emoji: r.emoji,
          createdAt: r.created_at,
        }));

        queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(messagesKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === message_id ? { ...m, reactions: mappedReactions } : m,
              ),
            })),
          };
        });
      },
    );

    return () => {
      unsubMessage();
      unsubOrder();
      unsubPayment();
      unsubConversation();
      unsubReaction();
    };
  }, [queryClient, updateOrder, updatePayment, incrementUnread, activeConversationId]);

  return { status, lastActivity, clearActivity };
}
