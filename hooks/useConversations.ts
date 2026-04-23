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
import { scheduledMessagesApi } from '@/lib/api/endpoints/scheduled-messages';
import { staffApi } from '@/lib/api/endpoints/staff';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { getTenantId } from '@/lib/auth/tokenStore';
import type { AddReactionPayload, PagedOut, ScheduleMessagePayload } from '@/lib/api/types';
import type { Conversation, Message, Reaction, ScheduledMessage, StaffMember } from '@/store';
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
    queryFn: ({ pageParam, signal }) => conversationsApi.listPaged(pageParam ?? null, signal),
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
  /** Customer phone / identifier — used to forward the message via WhatsApp. */
  recipient: string;
  /** WhatsApp template name configured in Meta Business Manager. */
  templateName?: string;
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
        reactions: [],
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
          idx === old.pages.length - 1 ? { ...page, items: [...page.items, optimistic] } : page,
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

    // ── Forward to WhatsApp after message is persisted ─────────────────────
    onSuccess: (_data, { recipient, payload, templateName }) => {
      if (payload.sender_role !== 'assistant') return;
      const tenantId = getTenantId();
      if (!tenantId || !recipient) return;
      notificationsApi
        .send({
          tenant_id: tenantId,
          recipient,
          channel: 'whatsapp',
          template_name: templateName ?? 'text_message',
          variables: { body: payload.content },
        })
        .catch((err: unknown) => {
          console.error('[useSendMessage] notification send failed:', err);
        });
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

// ─── useStaff ─────────────────────────────────────────────────────────────────

export const staffKeys = {
  all: ['staff'] as const,
  list: () => [...staffKeys.all, 'list'] as const,
};

/**
 * Fetch all staff members for the current tenant.
 * Used to populate the assignment dropdown.
 */
export function useStaff() {
  return useQuery<StaffMember[], Error>({
    queryKey: staffKeys.list(),
    queryFn: ({ signal }) => staffApi.list(signal),
    staleTime: 60_000,
  });
}

// ─── useAssignConversation ────────────────────────────────────────────────────

interface AssignVariables {
  conversationId: string;
  /** null to unassign */
  userId: string | null;
  /** The StaffMember object for the optimistic update — pass null to unassign */
  staffMember: StaffMember | null;
  assignedByUserId?: string | null;
}

/**
 * Assign or unassign a conversation with an optimistic update.
 *
 * The assignedTo field is patched immediately in the cache so the UI updates
 * without waiting for the server round-trip. Rolls back on error.
 */
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, AssignVariables>({
    mutationFn: ({ conversationId, userId, assignedByUserId }) =>
      conversationsApi.assign(conversationId, {
        user_id: userId,
        assigned_by_user_id: assignedByUserId,
      }),

    onMutate: async ({ conversationId, staffMember }) => {
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      await queryClient.cancelQueries({ queryKey: conversationKeys.detail(conversationId) });

      const previousLists = queryClient.getQueriesData<InfiniteData<PagedOut<Conversation>>>({
        queryKey: conversationKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Conversation>(
        conversationKeys.detail(conversationId),
      );

      // Patch in list caches
      queryClient.setQueriesData<InfiniteData<PagedOut<Conversation>>>(
        { queryKey: conversationKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((c) =>
                c.id === conversationId ? { ...c, assignedTo: staffMember } : c,
              ),
            })),
          };
        },
      );

      // Patch detail cache if present
      queryClient.setQueryData<Conversation>(
        conversationKeys.detail(conversationId),
        (old) => old ? { ...old, assignedTo: staffMember } : old,
      );

      return { previousLists, previousDetail };
    },

    onError: (_err, { conversationId }, context) => {
      const ctx = context as {
        previousLists?: [QueryKey, InfiniteData<PagedOut<Conversation>> | undefined][];
        previousDetail?: Conversation;
      } | undefined;

      if (ctx?.previousLists) {
        for (const [key, data] of ctx.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
      if (ctx?.previousDetail !== undefined) {
        queryClient.setQueryData(conversationKeys.detail(conversationId), ctx.previousDetail);
      }
    },

    onSettled: (_data, _error, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
    },
  });
}

// ─── useReactToMessage ────────────────────────────────────────────────────────

interface ReactToMessageVariables {
  conversationId: string;
  messageId: string;
  emoji: string;
  userId: string;
}

/**
 * Toggle an emoji reaction on a message with an optimistic update.
 *
 * Immediately patches the RQ messages cache so the UI feels instant.
 * On success, the optimistic reaction is replaced with the server's
 * canonical reaction list. On error the optimistic patch is rolled back.
 *
 * Toggle semantics (same as the backend):
 *   - Same emoji already set  → removes it
 *   - Different emoji already set → replaces it
 *   - No reaction yet → adds it
 */
export function useReactToMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, ReactToMessageVariables>({
    mutationFn: ({ conversationId, messageId, emoji, userId }: ReactToMessageVariables) =>
      conversationsApi.addReaction(conversationId, messageId, { emoji, user_id: userId } as AddReactionPayload),

    onMutate: async ({ conversationId, messageId, emoji, userId }: ReactToMessageVariables) => {
      const messagesKey = conversationKeys.messages(conversationId);
      await queryClient.cancelQueries({ queryKey: messagesKey });

      const previousMessages =
        queryClient.getQueryData<InfiniteData<PagedOut<Message>>>(messagesKey);

      queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(messagesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((msg) => {
              if (msg.id !== messageId) return msg;

              const existing = msg.reactions.find((r) => r.userId === userId);
              let newReactions: Reaction[];

              if (existing?.emoji === emoji) {
                // Toggle off — remove this user's reaction
                newReactions = msg.reactions.filter((r) => r.userId !== userId);
              } else {
                // Add or replace — remove old then append new
                const optimisticReaction: Reaction = {
                  id: `optimistic-${Date.now()}`,
                  userId,
                  emoji,
                  createdAt: new Date().toISOString(),
                };
                newReactions = [
                  ...msg.reactions.filter((r) => r.userId !== userId),
                  optimisticReaction,
                ];
              }

              return { ...msg, reactions: newReactions };
            }),
          })),
        };
      });

      return { previousMessages };
    },

    onError: (_error, { conversationId }, context) => {
      const messagesKey = conversationKeys.messages(conversationId);
      const ctx = context as { previousMessages?: InfiniteData<PagedOut<Message>> } | undefined;
      if (ctx?.previousMessages !== undefined) {
        queryClient.setQueryData(messagesKey, ctx.previousMessages);
      }
      console.error('[useReactToMessage] failed:', _error.message);
    },

    onSuccess: (updatedMessage, { conversationId }) => {
      // Replace the optimistic reactions with the server's canonical list
      const messagesKey = conversationKeys.messages(conversationId);
      queryClient.setQueryData<InfiniteData<PagedOut<Message>>>(messagesKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg,
            ),
          })),
        };
      });
    },
  });
}

// ─── Scheduled message query keys ─────────────────────────────────────────────

export const scheduledMessageKeys = {
  all: ['scheduledMessages'] as const,
  list: (conversationId: string) => [...scheduledMessageKeys.all, conversationId] as const,
};

// ─── useScheduledMessages ─────────────────────────────────────────────────────

/** Fetch pending scheduled messages for a conversation. */
export function useScheduledMessages(conversationId: string | null | undefined) {
  return useQuery<ScheduledMessage[], Error>({
    queryKey: scheduledMessageKeys.list(conversationId ?? ''),
    queryFn: ({ signal }) => scheduledMessagesApi.list(conversationId!, signal),
    enabled: Boolean(conversationId),
    staleTime: 15_000,
  });
}

// ─── useCreateScheduledMessage ────────────────────────────────────────────────

interface CreateScheduledVariables {
  conversationId: string;
  payload: ScheduleMessagePayload;
}

/** Schedule a message to be sent at a future time. */
export function useCreateScheduledMessage() {
  const queryClient = useQueryClient();

  return useMutation<ScheduledMessage, Error, CreateScheduledVariables>({
    mutationFn: ({ conversationId, payload }) =>
      scheduledMessagesApi.create(conversationId, payload),

    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: scheduledMessageKeys.list(conversationId),
      });
    },
  });
}

// ─── useCancelScheduledMessage ────────────────────────────────────────────────

interface CancelScheduledVariables {
  conversationId: string;
  scheduledMessageId: string;
}

/** Cancel a pending scheduled message with optimistic removal. */
export function useCancelScheduledMessage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelScheduledVariables>({
    mutationFn: ({ conversationId, scheduledMessageId }) =>
      scheduledMessagesApi.cancel(conversationId, scheduledMessageId),

    onMutate: async ({ conversationId, scheduledMessageId }) => {
      await queryClient.cancelQueries({
        queryKey: scheduledMessageKeys.list(conversationId),
      });
      const previous = queryClient.getQueryData<ScheduledMessage[]>(
        scheduledMessageKeys.list(conversationId),
      );
      queryClient.setQueryData<ScheduledMessage[]>(
        scheduledMessageKeys.list(conversationId),
        (old) => old?.filter((m) => m.id !== scheduledMessageId) ?? [],
      );
      return { previous };
    },

    onError: (_err, { conversationId }, context) => {
      const ctx = context as { previous?: ScheduledMessage[] } | undefined;
      if (ctx?.previous) {
        queryClient.setQueryData(scheduledMessageKeys.list(conversationId), ctx.previous);
      }
    },

    onSettled: (_data, _err, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: scheduledMessageKeys.list(conversationId),
      });
    },
  });
}
