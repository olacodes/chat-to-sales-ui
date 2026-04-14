/**
 * React Query hooks for the Conversations domain.
 *
 * Hooks:
 *   useConversations()              — infinite-scroll list of conversations
 *   useConversation(id)             — single conversation detail
 *   useMessages(conversationId)     — infinite-scroll message history
 *   useSendMessage(conversationId)  — send a message with optimistic update
 *
 * Query key factory (conversationKeys) is exported so sibling hooks can
 * precisely invalidate or prefetch related queries.
 */

'use client';

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/endpoints/conversations';
import type { PagedOut } from '@/lib/api/types';
import type { Conversation, Message } from '@/store';
import type { AddMessagePayload } from '@/lib/api/types';

// ─── Query key factory ────────────────────────────────────────────────────────

export const conversationKeys = {
  /** Root key — invalidates everything conversation-related */
  all: ['conversations'] as const,

  /** All paginated list queries */
  lists: () => [...conversationKeys.all, 'list'] as const,

  /** Specific list (e.g. with filters in the future) */
  list: (filters?: Record<string, unknown>) =>
    [...conversationKeys.lists(), filters ?? {}] as const,

  /** All detail queries */
  details: () => [...conversationKeys.all, 'detail'] as const,

  /** Single conversation detail */
  detail: (id: string) => [...conversationKeys.details(), id] as const,

  /** Messages for a specific conversation */
  messages: (conversationId: string) =>
    [...conversationKeys.detail(conversationId), 'messages'] as const,
} as const;

// ─── useConversations ─────────────────────────────────────────────────────────

/**
 * Cursor-paginated list of conversations.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage, isLoading } = useConversations();
 * const allConversations = data?.pages.flatMap(p => p.items) ?? [];
 */
export function useConversations() {
  return useInfiniteQuery<
    PagedOut<Conversation>,
    Error,
    InfiniteData<PagedOut<Conversation>>,
    QueryKey,
    string | null | undefined
  >({
    queryKey: conversationKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      conversationsApi.listPaged(pageParam ?? null, signal),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 30_000,
  });
}

// ─── useConversation ──────────────────────────────────────────────────────────

/**
 * Fetch a single conversation by ID, including its embedded messages.
 * Skips the request when `conversationId` is falsy.
 *
 * @example
 * const { data: conversation, isLoading } = useConversation(id);
 */
export function useConversation(conversationId: string | null | undefined) {
  return useQuery<Conversation, Error>({
    queryKey: conversationKeys.detail(conversationId ?? ''),
    queryFn: ({ signal }) => conversationsApi.get(conversationId!, signal),
    enabled: Boolean(conversationId),
    staleTime: 60_000,
  });
}

// ─── useMessages ──────────────────────────────────────────────────────────────

/**
 * Cursor-paginated message history for a conversation.
 * Skips the request when `conversationId` is falsy.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useMessages(conversationId);
 * const allMessages = data?.pages.flatMap(p => p.items) ?? [];
 */
export function useMessages(conversationId: string | null | undefined) {
  return useInfiniteQuery<
    PagedOut<Message>,
    Error,
    InfiniteData<PagedOut<Message>>,
    QueryKey,
    string | null | undefined
  >({
    queryKey: conversationKeys.messages(conversationId ?? ''),
    queryFn: ({ pageParam, signal }) =>
      conversationsApi.listMessages(conversationId!, pageParam ?? null, signal),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: Boolean(conversationId),
    // Messages change frequently — keep stale window short
    staleTime: 10_000,
  });
}

// ─── useSendMessage ───────────────────────────────────────────────────────────

interface SendMessageVariables {
  conversationId: string;
  payload: AddMessagePayload;
}

/**
 * Send a message with an optimistic update.
 *
 * On `mutate()` the message appears instantly in the cache with a temporary
 * id. If the server request fails the temporary message is rolled back and
 * an error is logged. On success the cache is invalidated so the server-
 * assigned id replaces the optimistic one.
 *
 * @example
 * const { mutate: sendMessage, isPending } = useSendMessage();
 * sendMessage({ conversationId, payload: { sender_role: 'assistant', content: text } });
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SendMessageVariables>({
    mutationFn: ({ conversationId, payload }) =>
      conversationsApi.addMessage(conversationId, payload),

    // ── Optimistic update ──────────────────────────────────────────────────
    onMutate: async ({ conversationId, payload }) => {
      const messagesKey = conversationKeys.messages(conversationId);

      // Cancel any in-flight refetch so it doesn't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: messagesKey });

      // Snapshot for potential rollback
      const previousMessages =
        queryClient.getQueryData<InfiniteData<PagedOut<Message>>>(messagesKey);

      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        role: payload.sender_role,
        senderIdentifier: null,
        content: payload.content,
        timestamp: new Date().toISOString(),
      };

      // Append to the last page (or create a seed page if cache is empty)
      queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(messagesKey, (old) => {
        if (!old) {
          return {
            pages: [{ items: [optimistic], next_cursor: null }],
            pageParams: [undefined],
          };
        }
        const pages = old.pages.map((page, idx) =>
          idx === old.pages.length - 1
            ? { ...page, items: [...page.items, optimistic] }
            : page,
        );
        return { ...old, pages };
      });

      return { previousMessages };
    },

    // ── Rollback on error ──────────────────────────────────────────────────
    onError: (error, { conversationId }, context) => {
      const messagesKey = conversationKeys.messages(conversationId);
      const ctx = context as { previousMessages?: InfiniteData<PagedOut<Message>> } | undefined;
      if (ctx?.previousMessages !== undefined) {
        queryClient.setQueryData(messagesKey, ctx.previousMessages);
      }
      console.error('[useSendMessage] failed:', error.message);
    },

    // ── Invalidate on settle so real id replaces optimistic id ─────────────
    onSettled: (_data, _error, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.messages(conversationId),
      });
      // Also refresh the conversation list so lastMessage / lastMessageAt update
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
