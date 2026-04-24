'use client';

import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { ConversationList } from '@/components/conversations/ConversationList';
import { RealtimeToast } from '@/components/conversations/RealtimeToast';
import { WsEventSimulator } from '@/components/conversations/WsEventSimulator';
import { useConversationsRealtime } from '@/lib/hooks/useConversationsRealtime';
import { useConversations } from '@/hooks/useConversations';

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const activeSegment = useSelectedLayoutSegment();

  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const resetUnread = useAppStore((s) => s.resetUnread);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.user_id ?? null;

  const {
    data: convsData,
    isLoading: isLoadingConvs,
    hasNextPage: hasMoreConvs,
    isFetchingNextPage: isFetchingMoreConvs,
    fetchNextPage: fetchMoreConvs,
  } = useConversations();

  const conversations = convsData?.pages.flatMap((p) => p.items) ?? [];
  const { lastActivity, clearActivity } = useConversationsRealtime();

  function handleSelectConversation(id: string) {
    setActiveConversation(id);
    resetUnread(id);
    router.push(`/conversations/${id}`);
  }

  // On mobile: hide the list when a conversation is open, hide the chat panel otherwise.
  // useSelectedLayoutSegment() returns the [id] value when on /conversations/[id], null on /conversations.
  const showingChat = Boolean(activeSegment);

  return (
    <div className="relative flex h-full overflow-hidden -m-6">
      <div className={`${showingChat ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto`}>
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          currentUserId={currentUserId}
          isLoading={isLoadingConvs}
          hasNextPage={hasMoreConvs}
          isFetchingNextPage={isFetchingMoreConvs}
          onLoadMore={() => fetchMoreConvs()}
        />
      </div>

      <div className={`${showingChat ? 'flex' : 'hidden md:flex'} h-full flex-1 min-w-0`}>
        {children}
      </div>

      <RealtimeToast activity={lastActivity} onDismiss={clearActivity} />

      {process.env.NODE_ENV === 'development' && (
        <WsEventSimulator activeConversationId={activeConversationId} />
      )}
    </div>
  );
}
