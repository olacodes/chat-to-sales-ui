'use client';

import { useEffect, useState } from 'react';
import { wsConnection } from '@/lib/websocket/connection';
import type { ConnectionStatus, WsMessage, MessageListener } from '@/lib/websocket/client';

// ─── useWsStatus ───────────────────────────────────────────────────────────────

/**
 * Returns the current WebSocket connection status, updated reactively.
 *
 * @example
 * const status = useWsStatus(); // 'connecting' | 'connected' | 'disconnected' | 'error'
 */
export function useWsStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(wsConnection.currentStatus);

  useEffect(() => {
    const unsubscribe = wsConnection.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

// ─── useWsMessage ─────────────────────────────────────────────────────────────

/**
 * Subscribe to a specific WebSocket message type. Use `'*'` for all messages.
 * The callback is stable-ref safe — always calls the latest version.
 *
 * @example
 * useWsMessage<OrderPayload>('order.created', (msg) => {
 *   console.log(msg.payload.id);
 * });
 */
export function useWsMessage<T = unknown>(type: string, listener: MessageListener<T>): void {
  // Keep a stable ref so the effect dep array never changes
  const listenerRef = { current: listener };
  listenerRef.current = listener;

  useEffect(() => {
    const unsubscribe = wsConnection.onMessage<T>(type, (msg) => {
      listenerRef.current(msg);
    });
    return unsubscribe;
    // `type` is the only dep that should trigger re-subscription
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
}

// ─── useWsMessages ────────────────────────────────────────────────────────────

/**
 * Accumulates the last `limit` messages of a given type into state.
 *
 * @example
 * const messages = useWsMessages<ChatMessage>('conversation.message', 50);
 */
export function useWsMessages<T = unknown>(type: string, limit = 100): WsMessage<T>[] {
  const [messages, setMessages] = useState<WsMessage<T>[]>([]);

  useWsMessage<T>(type, (msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      return next.length > limit ? next.slice(next.length - limit) : next;
    });
  });

  return messages;
}
