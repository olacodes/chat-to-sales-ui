'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
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
} from '@/hooks/useConversations';

// ─── Inbound message simulator ────────────────────────────────────────────────

function InboundMessageForm() {
  const [phone, setPhone] = useState('+2348012345678');
  const [text, setText] = useState('Hi, I want to place an order');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? 'tenant-abc-123';

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
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
          <h2 className="text-sm font-semibold text-gray-900">No active conversations</h2>
          <p className="mt-1 text-xs text-gray-500">
            Simulate an inbound message to start a conversation via the backend webhook.
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Tenant: <span className="font-mono">{tenantId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">Customer phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348012345678"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-700">Message</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hi, I want to place an order"
              required
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {sent && (
            <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
              ✓ Sent — waiting for WebSocket event…
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !phone.trim() || !text.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

  // ── React Query data ───────────────────────────────────────────────────────
  const {
    data: convsData,
    isLoading: isLoadingConvs,
    hasNextPage: hasMoreConvs,
    isFetchingNextPage: isFetchingMoreConvs,
    fetchNextPage: fetchMoreConvs,
  } = useConversations();

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

  function handleSendMessage(conversationId: string, content: string) {
    sendMessage({ conversationId, payload: { sender_role: 'assistant', content } });
  }

  return (
    <div className="relative flex h-full overflow-hidden -m-6">
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversation}
        isLoading={isLoadingConvs}
        hasNextPage={hasMoreConvs}
        isFetchingNextPage={isFetchingMoreConvs}
        onLoadMore={() => fetchMoreConvs()}
      />

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
        />
      ) : (
        <InboundMessageForm />
      )}

      <RealtimeToast activity={lastActivity} onDismiss={clearActivity} />

      {process.env.NODE_ENV === 'development' && (
        <WsEventSimulator activeConversationId={activeConversationId} />
      )}
    </div>
  );
}
