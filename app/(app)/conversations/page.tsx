'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { ConversationList } from '@/components/conversations/ConversationList';
import { ChatWindow } from '@/components/conversations/ChatWindow';
import { RealtimeToast } from '@/components/conversations/RealtimeToast';
import { WsEventSimulator } from '@/components/conversations/WsEventSimulator';
import { useConversationsRealtime } from '@/lib/hooks/useConversationsRealtime';
import { webhookService } from '@/lib/api/services';
import { ApiError } from '@/lib/api/client';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useStaff,
  useAssignConversation,
} from '@/hooks/useConversations';
import type { StaffMember } from '@/store';

// ─── Inbound message simulator ────────────────────────────────────────────────

function InboundMessageForm() {
  const [phone, setPhone] = useState('+2348012345678');
  const [text, setText] = useState('Hi, I want to place an order');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const tenantId = useAuthStore((s) => s.tenantId) ?? '';

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!phone.trim() || !text.trim()) return;
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      await webhookService.sendInboundMessage({
        channel: 'whatsapp',
        sender: phone.trim(),
        message: text.trim(),
        tenant_id: tenantId,
      });
      setSent(true);
      setText('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-1 items-center justify-center p-8"
      style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--ds-brand-bg-soft)', color: 'var(--ds-brand-text)' }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            No active conversations
          </h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            Simulate an inbound message to start a conversation via the backend webhook.
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }}>
            Tenant: <span className="font-mono">{tenantId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="inbound-phone"
              className="block mb-1 text-xs font-medium"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              Customer phone
            </label>
            <input
              id="inbound-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348012345678"
              required
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-shadow"
              style={{
                border: '1px solid var(--ds-border-base)',
                backgroundColor: 'var(--ds-bg-surface)',
                color: 'var(--ds-text-primary)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="inbound-message"
              className="block mb-1 text-xs font-medium"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              Message
            </label>
            <textarea
              id="inbound-message"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hi, I want to place an order"
              required
              className="w-full resize-none rounded-lg px-3 py-2 text-sm focus:outline-none transition-shadow"
              style={{
                border: '1px solid var(--ds-border-base)',
                backgroundColor: 'var(--ds-bg-surface)',
                color: 'var(--ds-text-primary)',
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: 'var(--ds-danger-text)', backgroundColor: 'var(--ds-danger-bg)' }}
            >
              {error}
            </p>
          )}
          {sent && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: 'var(--ds-success-text)', backgroundColor: 'var(--ds-success-bg)' }}
            >
              ✓ Sent — waiting for WebSocket event…
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !phone.trim() || !text.trim()}
            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: 'var(--ds-brand-bg)' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)';
            }}
          >
            {loading ? 'Sending…' : 'Send Inbound Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const updateConversation = useAppStore((s) => s.updateConversation);
  const orders = useAppStore((s) => s.orders);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.user_id ?? null;

  // ── React Query data ───────────────────────────────────────────────────────
  const {
    data: convsData,
    isLoading: isLoadingConvs,
    hasNextPage: hasMoreConvs,
    isFetchingNextPage: isFetchingMoreConvs,
    fetchNextPage: fetchMoreConvs,
  } = useConversations();

  const { data: staff = [] } = useStaff();
  const { mutate: assignConversation, isPending: isAssigning } = useAssignConversation();

  const conversations = convsData?.pages.flatMap((p) => p.items) ?? [];

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    hasNextPage: hasMoreMessages,
    isFetchingNextPage: isFetchingMoreMessages,
    fetchNextPage: fetchMoreMessages,
  } = useMessages(activeConversationId);

  const messages = messagesData?.pages.flatMap((p) => p.items) ?? [];

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  // ── Realtime ───────────────────────────────────────────────────────────────
  const { status, lastActivity, clearActivity } = useConversationsRealtime();

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  // Derive the order linked to the active conversation
  const linkedOrder = orders.find((o) => o.conversationId === activeConversationId) ?? null;

  function handleSendMessage(conversationId: string, content: string) {
    const conversation = conversations.find((c) => c.id === conversationId);
    sendMessage({
      conversationId,
      payload: { sender_role: 'assistant', content },
      recipient: conversation?.customerIdentifier ?? '',
    });
  }

  function handleMarkResolved(conversationId: string) {
    updateConversation(conversationId, { status: 'resolved' });
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

  function handleSelectConversation(id: string) {
    setActiveConversation(id);
  }

  function handleBack() {
    setActiveConversation(null);
  }

  // On mobile: show chat panel when a conversation is active, list otherwise.
  // On md+: both panels are always visible side-by-side.
  const showChat = activeConversation !== null;

  return (
    <div className="relative flex h-full overflow-hidden -m-6">
      {/* Conversation list — hidden on mobile when chat is open */}
      <div className={`${showChat ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto`}>
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

      {/* Chat panel — full-screen on mobile when active, flex-1 on md+ */}
      <div className={`${showChat ? 'flex' : 'hidden md:flex'} h-full flex-1 min-w-0`}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            hasMoreMessages={hasMoreMessages}
            isFetchingMoreMessages={isFetchingMoreMessages}
            onLoadMoreMessages={() => fetchMoreMessages()}
            onSendMessage={handleSendMessage}
            isSending={isSending}
            wsStatus={status}
            linkedOrder={linkedOrder}
            onMarkResolved={handleMarkResolved}
            onBack={handleBack}
            staff={staff}
            currentUserId={currentUserId}
            onAssign={handleAssign}
            isAssigning={isAssigning}
          />
        ) : (
          <InboundMessageForm />
        )}
      </div>

      <RealtimeToast activity={lastActivity} onDismiss={clearActivity} />

      {process.env.NODE_ENV === 'development' && (
        <WsEventSimulator activeConversationId={activeConversationId} />
      )}
    </div>
  );
}
