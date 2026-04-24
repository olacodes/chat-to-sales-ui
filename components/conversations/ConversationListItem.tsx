'use client';

import type { Conversation, ConversationStatus } from '@/store';
import { formatRelativeTime, getInitials } from './utils';

const statusDotColor: Record<ConversationStatus, string> = {
  open: 'var(--ds-success-dot)',
  pending: 'var(--ds-warning-dot)',
  resolved: 'var(--ds-text-tertiary)',
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
}: Readonly<ConversationListItemProps>) {
  const { customerName, customerIdentifier, status, lastMessage, lastMessageAt, unreadCount, assignedTo } =
    conversation;

  const assigneeLabel = assignedTo
    ? (assignedTo.displayName ?? assignedTo.email.split('@')[0])
    : null;
  const assigneeInitials = assignedTo
    ? getInitials(assignedTo.displayName ?? assignedTo.email)
    : null;
  const assigneeTooltip = assignedTo
    ? `${assignedTo.displayName ?? assignedTo.email}${assignedTo.displayName ? ` (${assignedTo.email})` : ''}`
    : null;

  const displayName = customerName || customerIdentifier;
  const initials = getInitials(displayName);
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className="w-full text-left flex items-start gap-3 px-4 py-3 border-l-2 transition-colors duration-150"
      style={{
        backgroundColor: isActive ? 'var(--ds-sidebar-item-active-bg)' : undefined,
        borderLeftColor: isActive ? 'var(--ds-brand-bg)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = '';
      }}
    >
      {/* Avatar with status dot */}
      <div className="relative mt-0.5 shrink-0">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: 'var(--ds-brand-bg-soft)',
            color: 'var(--ds-brand-text)',
          }}
        >
          {initials}
        </div>
        <span
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
          style={{
            backgroundColor: statusDotColor[status],
            borderColor: 'var(--ds-bg-surface)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}
            style={{ color: 'var(--ds-text-primary)' }}
          >
            {displayName}
          </span>
          {lastMessageAt && (
            <span className="text-[11px] shrink-0" style={{ color: 'var(--ds-text-tertiary)' }}>
              {formatRelativeTime(lastMessageAt)}
            </span>
          )}
        </div>

        {/* Sub-label: identifier only when a display name is present */}
        {customerName && customerName !== customerIdentifier && (
          <p
            className="text-[11px] truncate leading-tight mt-px"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            {customerIdentifier}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className="text-xs truncate"
            style={{
              color: hasUnread ? 'var(--ds-text-secondary)' : 'var(--ds-text-tertiary)',
            }}
          >
            {lastMessage ?? 'No messages yet'}
          </p>
          {hasUnread && (
            <span
              className="shrink-0 h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center animate-badge-pop"
              style={{
                backgroundColor: 'var(--ds-brand-bg)',
                color: 'var(--ds-text-inverse)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {assignedTo && (
          <div
            className="flex items-center gap-1 mt-1"
            title={assigneeTooltip ?? undefined}
          >
            <div
              className="h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{
                backgroundColor: 'var(--ds-bg-subtle)',
                color: 'var(--ds-text-secondary)',
              }}
            >
              {assigneeInitials}
            </div>
            <span
              className="text-[11px] truncate"
              style={{ color: 'var(--ds-text-tertiary)' }}
            >
              {assigneeLabel}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
