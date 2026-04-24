'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatWindow } from '@/components/conversations/ChatWindow';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import {
  useConversations,
  useMessages,
  useReactToMessage,
  useSendMessage,
  useStaff,
  useAssignConversation,
  useScheduledMessages,
  useCreateScheduledMessage,
  useCancelScheduledMessage,
} from '@/hooks/useConversations';
import type { StaffMember } from '@/store';

const LAST_CONVERSATION_KEY = 'lastConversationId';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const wsStatus = useWsStatus();

  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const resetUnread = useAppStore((s) => s.resetUnread);
  const updateConversation = useAppStore((s) => s.updateConversation);
  const orders = useAppStore((s) => s.orders);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.user_id ?? null;

  // Sync URL param → Zustand store and localStorage on every ID change.
  useEffect(() => {
    setActiveConversation(id);
    resetUnread(id);
    localStorage.setItem(LAST_CONVERSATION_KEY, id);
    return () => setActiveConversation(null);
  }, [id, setActiveConversation, resetUnread]);

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data: convsData } = useConversations();
  const conversations = convsData?.pages.flatMap((p) => p.items) ?? [];
  const activeConversation = conversations.find((c) => c.id === id) ?? null;

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    hasNextPage: hasMoreMessages,
    isFetchingNextPage: isFetchingMoreMessages,
    fetchNextPage: fetchMoreMessages,
  } = useMessages(id);

  const messages = messagesData?.pages.flatMap((p) => p.items) ?? [];

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: reactToMessage } = useReactToMessage();
  const { data: scheduledMessages = [] } = useScheduledMessages(id);
  const { mutate: createScheduledMessage } = useCreateScheduledMessage();
  const { mutate: cancelScheduledMessage } = useCancelScheduledMessage();
  const { data: staff = [] } = useStaff();
  const { mutate: assignConversation, isPending: isAssigning } = useAssignConversation();

  const linkedOrder = orders.find((o) => o.conversationId === id) ?? null;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSendMessage(conversationId: string, content: string) {
    const conversation = conversations.find((c) => c.id === conversationId);
    sendMessage({
      conversationId,
      payload: { sender_role: 'assistant', content },
      recipient: conversation?.customerIdentifier ?? '',
    });

    // Auto-assign to the current agent when replying to an unassigned conversation
    if (!conversation?.assignedTo && currentUserId) {
      const currentStaffMember = staff.find((s) => s.id === currentUserId) ?? null;
      assignConversation({
        conversationId,
        userId: currentUserId,
        staffMember: currentStaffMember,
        assignedByUserId: currentUserId,
      });
    }
  }

  function handleMarkResolved(conversationId: string) {
    updateConversation(conversationId, { status: 'resolved' });
  }

  function handleReact(conversationId: string, messageId: string, emoji: string) {
    if (!currentUserId) return;
    reactToMessage({ conversationId, messageId, emoji, userId: currentUserId });
  }

  function handleAssign(
    conversationId: string,
    userId: string | null,
    staffMember: StaffMember | null,
  ) {
    assignConversation({
      conversationId,
      userId,
      staffMember,
      assignedByUserId: currentUserId,
    });
  }

  function handleScheduleMessage(conversationId: string, content: string, scheduledFor: string) {
    createScheduledMessage({ conversationId, payload: { content, scheduled_for: scheduledFor } });
  }

  function handleCancelScheduledMessage(conversationId: string, scheduledMessageId: string) {
    cancelScheduledMessage({ conversationId, scheduledMessageId });
  }

  function handleBack() {
    router.push('/conversations');
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  // Show a neutral placeholder while conversations are still loading from the cache.
  if (!activeConversation) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
      >
        <div
          className="h-3 w-28 rounded animate-pulse"
          style={{ backgroundColor: 'var(--ds-bg-subtle)' }}
        />
      </div>
    );
  }

  return (
    <ChatWindow
      conversation={activeConversation}
      messages={messages}
      isLoadingMessages={isLoadingMessages}
      hasMoreMessages={hasMoreMessages}
      isFetchingMoreMessages={isFetchingMoreMessages}
      onLoadMoreMessages={() => fetchMoreMessages()}
      onSendMessage={handleSendMessage}
      isSending={isSending}
      wsStatus={wsStatus}
      linkedOrder={linkedOrder}
      onMarkResolved={handleMarkResolved}
      onBack={handleBack}
      staff={staff}
      currentUserId={currentUserId}
      onAssign={handleAssign}
      isAssigning={isAssigning}
      onReact={handleReact}
      scheduledMessages={scheduledMessages}
      onCancelScheduledMessage={handleCancelScheduledMessage}
      onScheduleMessage={handleScheduleMessage}
    />
  );
}
