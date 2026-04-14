'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { wsConnection } from '@/lib/websocket/connection';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import { useAppStore } from '@/store';
import type {
  MessageReceivedPayload,
  OrderStateChangedPayload,
  PaymentConfirmedPayload,
} from '@/lib/websocket/events';

export interface RealtimeActivity {
  type: 'MessageReceived' | 'OrderStateChanged' | 'PaymentConfirmed';
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

/**
 * Page-level hook for the Conversations screen.
 *
 * Subscribes to the three named backend events and routes them into the
 * Zustand store. Also returns reactive connection status and last-activity
 * info for in-page UI feedback.
 */
export function useConversationsRealtime(): UseConversationsRealtimeReturn {
  const status = useWsStatus();
  const [lastActivity, setLastActivity] = useState<RealtimeActivity | null>(null);

  // Store actions — read once, stable across renders
  const addMessage = useAppStore((s) => s.addMessage);
  const addConversation = useAppStore((s) => s.addConversation);
  const updateOrder = useAppStore((s) => s.updateOrder);
  const updatePayment = useAppStore((s) => s.updatePayment);
  const conversations = useAppStore((s) => s.conversations);

  // Keep a ref so event callbacks always have the latest conversations list
  // without needing to re-subscribe on every render.
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const clearActivity = useCallback(() => setLastActivity(null), []);

  useEffect(() => {
    // ── MessageReceived ────────────────────────────────────────────────────
    const unsubMessage = wsConnection.onMessage<MessageReceivedPayload>(
      'MessageReceived',
      (msg) => {
        const { id, conversationId, sender_role, sender_identifier, content, timestamp } = msg.payload;

        // If this conversation doesn't exist yet in the store, we can't place
        // the message — the backend should send a conversation.started first,
        // but be defensive.
        const exists = conversationsRef.current.some((c) => c.id === conversationId);
        if (!exists) return;

        addMessage({ id, conversationId, role: sender_role, senderIdentifier: sender_identifier ?? null, content, timestamp });

        const conv = conversationsRef.current.find((c) => c.id === conversationId);
        const name = conv?.customerName ?? 'Unknown';

        setLastActivity({
          type: 'MessageReceived',
          label: `New message from ${name}`,
          at: Date.now(),
        });
      },
    );

    // ── OrderStateChanged ──────────────────────────────────────────────────
    const unsubOrder = wsConnection.onMessage<OrderStateChangedPayload>(
      'OrderStateChanged',
      (msg) => {
        const { orderId, status: orderStatus, updatedAt } = msg.payload;
        updateOrder(orderId, { status: orderStatus, updatedAt });

        setLastActivity({
          type: 'OrderStateChanged',
          label: `Order ${orderId} → ${orderStatus}`,
          at: Date.now(),
        });
      },
    );

    // ── PaymentConfirmed ───────────────────────────────────────────────────
    const unsubPayment = wsConnection.onMessage<PaymentConfirmedPayload>(
      'PaymentConfirmed',
      (msg) => {
        const { paymentId, paidAt } = msg.payload;
        updatePayment(paymentId, { status: 'paid', paidAt });

        setLastActivity({
          type: 'PaymentConfirmed',
          label: `Payment confirmed`,
          at: Date.now(),
        });
      },
    );

    return () => {
      unsubMessage();
      unsubOrder();
      unsubPayment();
    };
  }, [addMessage, addConversation, updateOrder, updatePayment]);

  return { status, lastActivity, clearActivity };
}
