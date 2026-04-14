'use client';

import { useEffect, useRef } from 'react';
import type { Conversation, Message } from '@/store';
import type { ConnectionStatus } from '@/lib/websocket/client';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Badge } from '@/components/ui/Badge';

interface ChatWindowProps {
  conversation: Conversation;
  /** Explicit message list — from React Query. Falls back to conversation.messages. */
  messages?: Message[];
  /** Show a loading skeleton while the first page of messages is fetching. */
  isLoadingMessages?: boolean;
  /** Show a "load earlier" button at the top when more pages exist. */
  hasMoreMessages?: boolean;
  isFetchingMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
  onSendMessage: (conversationId: string, content: string) => void;
  isSending?: boolean;
  wsStatus: ConnectionStatus;
}

const statusBadge = {
  open: (
    <Badge variant="success" dot>
      Open
    </Badge>
  ),
  pending: (
    <Badge variant="warning" dot>
      Pending
    </Badge>
  ),
  resolved: (
    <Badge variant="default" dot>
      Resolved
    </Badge>
  ),
} as const;

const wsBanner: Record<ConnectionStatus, { show: boolean; text: string; cls: string }> = {
  connected: { show: false, text: '', cls: '' },
  connecting: {
    show: true,
    text: 'Connecting to live updates…',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  disconnected: {
    show: true,
    text: 'Disconnected — reconnecting…',
    cls: 'bg-red-50   text-red-700   border-red-200',
  },
  error: {
    show: true,
    text: 'Connection error — retrying…',
    cls: 'bg-red-50   text-red-700   border-red-200',
  },
};

export function ChatWindow({
  conversation,
  messages: messagesProp,
  isLoadingMessages = false,
  hasMoreMessages = false,
  isFetchingMoreMessages = false,
  onLoadMoreMessages,
  onSendMessage,
  isSending = false,
  wsStatus,
}: ChatWindowProps) {
  const { id, customerName, customerIdentifier, status } = conversation;
  // Prefer explicit prop (React Query) over embedded store messages
  const messages = messagesProp ?? conversation.messages;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const banner = wsBanner[wsStatus];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
            {customerName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{customerName}</p>
            <p className="text-xs text-gray-500">{customerIdentifier}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusBadge[status]}
          {status !== 'resolved' && (
            <button
              type="button"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Mark resolved
            </button>
          )}
        </div>
      </div>

      {/* WS connection banner */}
      {banner.show && (
        <div
          className={`flex items-center gap-2 border-b px-5 py-2 text-xs font-medium ${banner.cls}`}
        >
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {banner.text}
        </div>
      )}

      {/* Messages area */}
      <div className="relative flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3 bg-gray-50">
        {/* Load earlier button */}
        {hasMoreMessages && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onLoadMoreMessages}
              disabled={isFetchingMoreMessages}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium"
            >
              {isFetchingMoreMessages ? 'Loading…' : 'Load earlier messages'}
            </button>
          </div>
        )}

        {isLoadingMessages && messages.length === 0 ? (
          // Loading skeleton
          <div className="space-y-3">
            {[80, 60, 72, 50].map((w, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="h-8 rounded-2xl bg-gray-200 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const isGrouped = Boolean(prev && prev.role === msg.role);
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                customerName={customerName}
                isGrouped={isGrouped}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={(content) => onSendMessage(id, content)}
        disabled={status === 'resolved'}
      />
    </div>
  );
}
