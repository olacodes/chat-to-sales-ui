/**
 * Conversations endpoint
 *
 * tenant_id is injected automatically by the base client — no caller
 * needs to supply it.
 */

import { apiClient } from '../client';
import type {
  ConversationOut,
  MessageOut,
  PagedOut,
  CreateConversationPayload,
  AddMessagePayload,
} from '../types';
import type { Conversation, Message } from '@/store';

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapMessage(m: MessageOut): Message {
  return {
    id: m.id,
    conversationId: m.conversation_id,
    role: m.sender_role,
    senderIdentifier: m.sender_identifier ?? null,
    content: m.content,
    timestamp: m.created_at,
  };
}

function mapConversation(c: ConversationOut): Conversation {
  return {
    id: c.id,
    customerName: c.customer_name ?? c.customer_identifier,
    customerIdentifier: c.customer_identifier,
    // Backend uses 'closed'; store uses 'resolved'
    status: c.status === 'closed' ? 'resolved' : c.status,
    lastMessage: c.messages?.at(-1)?.content ?? null,
    lastMessageAt: c.messages?.at(-1)?.created_at ?? null,
    unreadCount: 0,
    messages: (c.messages ?? []).map(mapMessage),
  };
}

/**
 * Normalises flat-array or paginated-envelope responses into a uniform
 * PagedOut<T> shape so callers always work with the same structure.
 */
function normalizePaged<Raw, Domain>(
  response: Raw[] | PagedOut<Raw>,
  mapper: (r: Raw) => Domain,
): PagedOut<Domain> {
  if (Array.isArray(response)) {
    return { items: response.map(mapper), next_cursor: null };
  }
  return { items: response.items.map(mapper), next_cursor: response.next_cursor };
}

const BASE = '/api/v1';

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const conversationsApi = {
  // ── Flat list (existing — kept for backward compat) ──────────────────────

  /** GET /api/v1/conversations — tenant_id injected automatically */
  list(signal?: AbortSignal): Promise<Conversation[]> {
    return apiClient
      .get<ConversationOut[]>(`${BASE}/conversations`, undefined, signal)
      .then((items) => items.map(mapConversation));
  },

  // ── Cursor-paged list ─────────────────────────────────────────────────────

  /**
   * GET /api/v1/conversations?cursor={cursor}
   * Returns a normalised page regardless of whether the backend sends a flat
   * array or a cursor envelope.
   */
  listPaged(cursor?: string | null, signal?: AbortSignal): Promise<PagedOut<Conversation>> {
    const qs = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    return apiClient
      .get<ConversationOut[] | PagedOut<ConversationOut>>(
        `${BASE}/conversations${qs ? `?${qs.slice(1)}` : ''}`,
        undefined,
        signal,
      )
      .then((res) => normalizePaged(res, mapConversation));
  },

  // ── Single conversation ───────────────────────────────────────────────────

  /** GET /api/v1/conversations/{id} */
  get(id: string, signal?: AbortSignal): Promise<Conversation> {
    return apiClient
      .get<ConversationOut>(`${BASE}/conversations/${encodeURIComponent(id)}`, undefined, signal)
      .then(mapConversation);
  },

  // ── Messages ──────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/conversations/{id}/messages?cursor={cursor}
   * Normalised to PagedOut<Message> regardless of backend response shape.
   */
  listMessages(
    conversationId: string,
    cursor?: string | null,
    signal?: AbortSignal,
  ): Promise<PagedOut<Message>> {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return apiClient
      .get<MessageOut[] | PagedOut<MessageOut>>(
        `${BASE}/conversations/${encodeURIComponent(conversationId)}/messages${qs}`,
        undefined,
        signal,
      )
      .then((res) => normalizePaged(res, mapMessage));
  },

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** POST /api/v1/conversations */
  create(payload: CreateConversationPayload, signal?: AbortSignal): Promise<Conversation> {
    return apiClient
      .post<ConversationOut>(`${BASE}/conversations`, payload, undefined, signal)
      .then(mapConversation);
  },

  /** POST /api/v1/conversations/{id}/messages */
  addMessage(
    conversationId: string,
    payload: AddMessagePayload,
    signal?: AbortSignal,
  ): Promise<Message> {
    return apiClient
      .post<MessageOut>(
        `${BASE}/conversations/${encodeURIComponent(conversationId)}/messages`,
        payload,
        undefined,
        signal,
      )
      .then(mapMessage);
  },
};
