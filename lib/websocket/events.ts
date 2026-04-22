/**
 * Typed contracts for backend WebSocket events.
 *
 * Backend sends WsMessage<T> envelopes:
 *   { type: string, payload: T, timestamp?: string }
 *
 * Event type strings (as sent by the server):
 *   'message.received'   — new message in a conversation
 *   'order.updated'      — order state changed
 *   'payment.confirmed'  — payment marked as paid
 *   'order.created'      — new order placed
 *   'conversation.started' / 'conversation.closed'  — conversation lifecycle
 */

import type { MessageRole, OrderStatus } from '@/store';

// ─── message.received ─────────────────────────────────────────────────────────

/**
 * Payload for the `message.received` (or `conversation.message`) event.
 *
 * The backend may serialise field names in camelCase or snake_case depending
 * on its Pydantic/serialiser configuration, so both variants are declared as
 * optional. At least one of each pair will be present at runtime.
 */
export interface MessageReceivedPayload {
  id: string;
  /** camelCase variant */
  conversationId?: string;
  /** snake_case variant (Python/FastAPI default) */
  conversation_id?: string;
  sender_role: MessageRole;
  sender_identifier?: string | null;
  content: string;
  /** camelCase variant */
  timestamp?: string;
  /** snake_case variant (Python/FastAPI default) */
  created_at?: string;
}

// ─── order.updated / order.created ───────────────────────────────────────────

export interface OrderStateChangedPayload {
  orderId: string;
  /** The conversation this order is linked to, if any */
  conversationId: string | null;
  status: OrderStatus;
  updatedAt: string;
}

// ─── payment.confirmed ────────────────────────────────────────────────────────

export interface PaymentConfirmedPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paidAt: string;
}

// ─── conversation.started (conversation created) ────────────────────────────

export interface ConversationCreatedPayload {
  id: string;
  customer_identifier: string;
  customer_name?: string | null;
  status: 'open' | 'closed' | 'pending';
  created_at: string;
}

// ─── conversation.message_saved ───────────────────────────────────────────────

/**
 * Payload for `conversation.message_saved`.
 * Published by the backend AFTER the message has been committed to the
 * database, so it is safe to invalidate API queries on receipt.
 */
export interface ConversationMessageSavedPayload {
  /** Database ID of the persisted message */
  id: string;
  conversation_id: string;
  sender_role: MessageRole;
  sender_identifier: string | null;
  content: string;
  created_at: string | null;
  tenant_id: string;
  channel: string;
  customer_identifier: string;
}

// ─── conversation.updated ────────────────────────────────────────────────────

export interface ConversationUpdatedPayload {
  id: string;
  status?: 'open' | 'closed' | 'pending';
  last_message?: string | null;
  updated_at: string;
}

// ─── Discriminated union ──────────────────────────────────────────────────────

export type RealtimeEventType =
  | 'message.received'
  | 'conversation.message_saved'
  | 'order.updated'
  | 'order.created'
  | 'payment.confirmed'
  | 'conversation.started'
  | 'conversation.updated'
  | 'conversation.closed';

export type RealtimeEventPayload =
  | { type: 'message.received'; payload: MessageReceivedPayload }
  | { type: 'order.updated'; payload: OrderStateChangedPayload }
  | { type: 'order.created'; payload: OrderStateChangedPayload }
  | { type: 'payment.confirmed'; payload: PaymentConfirmedPayload }
  | { type: 'conversation.started'; payload: ConversationCreatedPayload }
  | { type: 'conversation.updated'; payload: ConversationUpdatedPayload }
  | { type: 'conversation.closed'; payload: ConversationUpdatedPayload };
