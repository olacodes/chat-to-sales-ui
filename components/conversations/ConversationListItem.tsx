'use client';

import type { Conversation, ConversationStatus } from '@/store';
import { formatRelativeTime, getInitials } from './utils';

const statusRing: Record<ConversationStatus, string> = {
  open: 'ring-green-400',
  pending: 'ring-amber-400',
  resolved: 'ring-gray-300',
};

const statusDot: Record<ConversationStatus, string> = {
  open: 'bg-green-400',
  pending: 'bg-amber-400',
  resolved: 'bg-gray-300',
};

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: ConversationListItemProps) {
  const { customerName, customerIdentifier, status, lastMessage, lastMessageAt, unreadCount } = conversation;
  // Prefer explicit name; fall back to the channel identifier (phone, user id, etc.)
  const displayName = customerName || customerIdentifier;
  const initials = getInitials(displayName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-l-2',
        'hover:bg-gray-50',
        isActive ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent',
      ].join(' ')}
    >
      {/* Avatar */}
      <div className="relative mt-0.5 shrink-0">
        <div
          className={`h-10 w-10 rounded-full bg-blue-100 ring-2 ${statusRing[status]} flex items-center justify-center text-blue-700 text-xs font-bold`}
        >
          {initials}
        </div>
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${statusDot[status]}`}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
          {lastMessageAt && (
            <span className="text-xs text-gray-400 shrink-0">
              {formatRelativeTime(lastMessageAt)}
            </span>
          )}
        </div>
        {/* Show identifier as sub-label only when displayName is the name */}
        {customerName && customerName !== customerIdentifier && (
          <p className="text-[11px] text-gray-400 truncate leading-tight mt-px">{customerIdentifier}</p>
        )}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-gray-500 truncate">{lastMessage ?? 'No messages yet'}</p>
          {unreadCount > 0 && (
            <span className="shrink-0 h-4 min-w-4 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
