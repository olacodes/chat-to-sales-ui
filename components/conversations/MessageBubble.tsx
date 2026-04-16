'use client';

import type { Message, MessageRole } from '@/store';
import { formatMessageTime, getInitials } from './utils';

export type DeliveryState = 'sent' | 'delivered' | 'read' | 'failed';

interface MessageBubbleProps {
  message: Message;
  customerName: string;
  /** True when the previous message was from the same sender — hides avatar. */
  isGrouped: boolean;
  /** Optional delivery state for outgoing messages. */
  deliveryState?: DeliveryState;
}

/* ── Delivery indicator ──────────────────────────────────────── */

function DeliveryIcon({ state }: Readonly<{ state: DeliveryState }>) {
  if (state === 'failed') {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[10px]"
        style={{ color: 'var(--ds-danger-dot)' }}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Failed · Retry
      </span>
    );
  }
  if (state === 'read') {
    return (
      <span
        className="text-[10px] font-medium"
        style={{ color: 'var(--ds-success-dot)' }}
        aria-label="Read"
      >
        ✓✓
      </span>
    );
  }
  if (state === 'delivered') {
    return (
      <span
        className="text-[10px]"
        style={{ color: 'var(--ds-text-tertiary)' }}
        aria-label="Delivered"
      >
        ✓✓
      </span>
    );
  }
  return (
    <span
      className="text-[10px]"
      style={{ color: 'var(--ds-text-tertiary)' }}
      aria-label="Sent"
    >
      ✓
    </span>
  );
}

/* ── Hover action toolbar ────────────────────────────────────── */

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({ label, onClick, children }: Readonly<ToolbarButtonProps>) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors duration-100"
      style={{
        backgroundColor: 'var(--ds-bg-elevated)',
        color: 'var(--ds-text-secondary)',
        boxShadow: 'var(--ds-shadow-sm)',
        border: '1px solid var(--ds-border-base)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
    >
      {children}
    </button>
  );
}

interface BubbleToolbarProps {
  isOutgoing: boolean;
  onCopy: () => void;
}

function BubbleToolbar({ isOutgoing, onCopy }: Readonly<BubbleToolbarProps>) {
  // Toolbar appears on the opposite side of the bubble alignment
  const sideClass = isOutgoing ? 'order-first mr-1' : 'order-last ml-1';

  return (
    <div
      className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0 ${sideClass}`}
    >
      <ToolbarButton label="React" onClick={() => {}}>
        😊
      </ToolbarButton>
      <ToolbarButton label="Reply" onClick={() => {}}>
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </ToolbarButton>
      <ToolbarButton label="Copy" onClick={onCopy}>
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </ToolbarButton>
    </div>
  );
}

/* ── Avatar initials mapping ─────────────────────────────────── */

const roleInitialsFallback: Partial<Record<MessageRole, string>> = {
  assistant: 'AG',
  system: 'SY',
};

/* ── Main component ──────────────────────────────────────────── */

export function MessageBubble({
  message,
  customerName,
  isGrouped,
  deliveryState,
}: Readonly<MessageBubbleProps>) {
  const { role, content, timestamp } = message;

  // assistant = outgoing (right-aligned, brand green)
  // user      = incoming (left-aligned, neutral white/dark)
  const isOutgoing = role === 'assistant';

  const bubbleInitials =
    role === 'user' ? getInitials(customerName) : (roleInitialsFallback[role] ?? '?');

  /* System messages — centered event pill, no bubble chrome */
  if (role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span
          className="text-[11px] px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--ds-bg-sunken)',
            color: 'var(--ds-text-tertiary)',
          }}
        >
          {content}
        </span>
      </div>
    );
  }

  function handleCopy() {
    void navigator.clipboard.writeText(content);
  }

  return (
    <div
      className={`group flex items-end gap-1 animate-slide-up ${isOutgoing ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar — invisible (not hidden) when grouped to preserve column width */}
      <div
        className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
          isGrouped ? 'invisible' : ''
        }`}
        style={{
          backgroundColor: isOutgoing
            ? 'var(--ds-accent-bg-soft)'
            : 'var(--ds-brand-bg-soft)',
          color: isOutgoing ? 'var(--ds-accent-text)' : 'var(--ds-brand-text)',
        }}
        aria-hidden="true"
      >
        {bubbleInitials}
      </div>

      {/* Hover toolbar — flex sibling so it never clips the bubble */}
      <BubbleToolbar isOutgoing={isOutgoing} onCopy={handleCopy} />

      {/* Bubble + meta column */}
      <div
        className={`flex max-w-[72%] flex-col gap-1 ${isOutgoing ? 'items-end' : 'items-start'}`}
      >
        {/* Sender label — only for first message in a group from customer */}
        {!isGrouped && !isOutgoing && (
          <span
            className="text-[10px] px-1"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            {customerName}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOutgoing ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}
          style={
            isOutgoing
              ? {
                  backgroundColor: 'var(--ds-chat-bubble-outbound)',
                  color: 'var(--ds-chat-text-outbound)',
                }
              : {
                  backgroundColor: 'var(--ds-chat-bubble-inbound)',
                  color: 'var(--ds-chat-text-inbound)',
                  border: '1px solid var(--ds-chat-bubble-in-border)',
                }
          }
        >
          {content}
        </div>

        {/* Timestamp + delivery state */}
        <div
          className={`flex items-center gap-1 px-0.5 ${isOutgoing ? 'flex-row-reverse' : ''}`}
        >
          <time
            className="text-[10px]"
            style={{ color: 'var(--ds-text-tertiary)' }}
            dateTime={timestamp}
          >
            {formatMessageTime(timestamp)}
          </time>
          {isOutgoing && deliveryState && <DeliveryIcon state={deliveryState} />}
        </div>
      </div>
    </div>
  );
}
