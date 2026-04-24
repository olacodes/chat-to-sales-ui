'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Message, MessageRole } from '@/store';
import { formatMessageTime, getInitials } from './utils';

// ─── Reply quote parser ───────────────────────────────────────
// Detects the pattern written by ChatInput when replying:
//   > Sender: quoted text\n\nreply text

interface ParsedReply {
  quotedSender: string;
  quotedText: string;
  replyText: string;
}

function parseReplyContent(content: string): ParsedReply | null {
  // Pattern: "> Sender: quoted text\n\nreply text"
  // The quoted text itself may span multiple lines via the excerpt, but the
  // double newline is the delimiter between quote and reply.
  const match = /^> ([^:]+): ([\s\S]+?)\n\n([\s\S]+)$/.exec(content);
  if (!match) return null;
  return {
    quotedSender: match[1].trim(),
    quotedText: match[2].trim(),
    replyText: match[3].trim(),
  };
}

// ─── Emoji picker ─────────────────────────────────────────────

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '😅', '🔥'];

interface EmojiPickerProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isOutgoing: boolean;
}

function EmojiPicker({ anchorRef, onSelect, onClose, isOutgoing }: Readonly<EmojiPickerProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const PICKER_H = 52;
    const PICKER_W = 320;
    // Open above the button; flip below if it would be cut off by the top
    const top = rect.top > PICKER_H + 12 ? rect.top - PICKER_H - 8 : rect.bottom + 8;
    // Align to the bubble's side, clamped within the viewport
    const rawLeft = isOutgoing ? rect.right - PICKER_W : rect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - PICKER_W - 8));
    setPos({ position: 'fixed', top, left, visibility: 'visible' });
  }, [anchorRef, isOutgoing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const outsidePicker = ref.current && !ref.current.contains(target);
      const outsideAnchor = anchorRef.current && !anchorRef.current.contains(target);
      if (outsidePicker && outsideAnchor) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  return createPortal(
    <div
      ref={ref}
      aria-label="Emoji reactions"
      className="z-[9999] flex items-center gap-1 rounded-full px-2 py-1.5"
      style={{
        ...pos,
        backgroundColor: 'var(--ds-bg-elevated)',
        border: '1px solid var(--ds-border-base)',
        boxShadow: 'var(--ds-shadow-md)',
      }}
    >
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-125"
          style={{ lineHeight: 1 }}
        >
          {emoji}
        </button>
      ))}
    </div>,
    document.body,
  );
}

export type DeliveryState = 'sent' | 'delivered' | 'read' | 'failed';

interface MessageBubbleProps {
  message: Message;
  customerName: string;
  /** True when the previous message was from the same sender — hides avatar. */
  isGrouped: boolean;
  /** Optional delivery state for outgoing messages. */
  deliveryState?: DeliveryState;
  /** Called when the user clicks the Reply button on this message. */
  onReply?: (message: Message) => void;
  /** Called when the user picks or taps an emoji reaction. */
  onReact?: (emoji: string) => void;
  /** The currently authenticated user's ID — used to highlight their reaction. */
  currentUserId?: string | null;
  /** Resolved agent name for assistant messages — derived from the staff list by the caller. */
  agentName?: string | null;
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
    <span className="text-[10px]" style={{ color: 'var(--ds-text-tertiary)' }} aria-label="Sent">
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
  onReply: () => void;
  onEmojiClick: () => void;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function BubbleToolbar({
  isOutgoing,
  onCopy,
  onReply,
  onEmojiClick,
  emojiButtonRef,
}: Readonly<BubbleToolbarProps>) {
  // Toolbar appears on the opposite side of the bubble alignment
  const sideClass = isOutgoing ? 'order-first mr-1' : 'order-last ml-1';

  return (
    <div
      className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0 ${sideClass}`}
    >
      <button
        ref={emojiButtonRef}
        type="button"
        aria-label="React"
        onClick={onEmojiClick}
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
        😊
      </button>
      <ToolbarButton label="Reply" onClick={onReply}>
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
  system: 'SY',
};

/* ── Main component ──────────────────────────────────────────── */

export function MessageBubble({
  message,
  customerName,
  isGrouped,
  deliveryState,
  onReply,
  onReact,
  currentUserId,
  agentName,
}: Readonly<MessageBubbleProps>) {
  const { role, content, timestamp, reactions } = message;
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // assistant = outgoing (right-aligned, brand green)
  // user      = incoming (left-aligned, neutral white/dark)
  const isOutgoing = role === 'assistant';

  const bubbleInitials =
    role === 'user'
      ? getInitials(customerName)
      : role === 'assistant'
        ? (agentName ? getInitials(agentName) : 'AI')
        : (roleInitialsFallback[role] ?? '?');

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
    const parsed = parseReplyContent(content);
    void navigator.clipboard.writeText(parsed ? parsed.replyText : content);
  }

  function handleReply() {
    onReply?.(message);
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
          backgroundColor: isOutgoing ? 'var(--ds-accent-bg-soft)' : 'var(--ds-brand-bg-soft)',
          color: isOutgoing ? 'var(--ds-accent-text)' : 'var(--ds-brand-text)',
        }}
        aria-hidden="true"
      >
        {bubbleInitials}
      </div>

      {/* Hover toolbar — flex sibling so it never clips the bubble */}
      <BubbleToolbar
        isOutgoing={isOutgoing}
        onCopy={handleCopy}
        onReply={handleReply}
        onEmojiClick={() => setPickerOpen((prev) => !prev)}
        emojiButtonRef={emojiButtonRef}
      />

      {/* Bubble + meta column */}
      <div
        className={`relative flex max-w-[72%] flex-col gap-1 ${isOutgoing ? 'items-end' : 'items-start'}`}
      >
        {/* Emoji picker portal — rendered via fixed positioning to escape overflow clipping */}
        {pickerOpen && (
          <EmojiPicker
            anchorRef={emojiButtonRef}
            isOutgoing={isOutgoing}
            onSelect={(emoji) => {
              onReact?.(emoji);
            }}
            onClose={() => setPickerOpen(false)}
          />
        )}

        {/* Sender label — first message in a group */}
        {!isGrouped && !isOutgoing && (
          <span className="text-[10px] px-1" style={{ color: 'var(--ds-text-tertiary)' }}>
            {customerName}
          </span>
        )}
        {!isGrouped && isOutgoing && (
          <span className="text-[10px] px-1" style={{ color: 'var(--ds-text-tertiary)' }}>
            {agentName ?? 'AI Assistant'}
          </span>
        )}

        {/* Bubble */}
        {(() => {
          const parsed = parseReplyContent(content);
          const bubbleStyle = isOutgoing
            ? {
                backgroundColor: 'var(--ds-chat-bubble-outbound)',
                color: 'var(--ds-chat-text-outbound)',
              }
            : {
                backgroundColor: 'var(--ds-chat-bubble-inbound)',
                color: 'var(--ds-chat-text-inbound)',
                border: '1px solid var(--ds-chat-bubble-in-border)',
              };

          if (parsed) {
            // WhatsApp-style: quoted block on top, reply text below
            const quoteBarColor = isOutgoing ? 'rgba(255,255,255,0.5)' : 'var(--ds-brand-bg)';
            const quoteBgColor = isOutgoing ? 'rgba(0,0,0,0.1)' : 'var(--ds-bg-sunken)';
            const quoteSenderColor = isOutgoing ? 'rgba(255,255,255,0.9)' : 'var(--ds-brand-text)';
            const quoteTextColor = isOutgoing
              ? 'rgba(255,255,255,0.75)'
              : 'var(--ds-text-secondary)';

            return (
              <div
                className={`rounded-2xl text-sm leading-relaxed overflow-hidden ${
                  isOutgoing ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
                style={bubbleStyle}
              >
                {/* Quoted block */}
                <div
                  className="flex gap-0 mx-2 mt-2 mb-0 rounded-lg overflow-hidden"
                  style={{ backgroundColor: quoteBgColor }}
                >
                  {/* Colored left bar */}
                  <div
                    className="w-1 shrink-0 rounded-l-lg"
                    style={{ backgroundColor: quoteBarColor }}
                  />
                  <div className="flex flex-col gap-0.5 px-2.5 py-2 min-w-0">
                    <span
                      className="text-[11px] font-semibold leading-none"
                      style={{ color: quoteSenderColor }}
                    >
                      {parsed.quotedSender}
                    </span>
                    <span
                      className="text-xs leading-snug line-clamp-2"
                      style={{ color: quoteTextColor }}
                    >
                      {parsed.quotedText}
                    </span>
                  </div>
                </div>
                {/* Reply text */}
                <div className="px-3.5 py-2.5">{parsed.replyText}</div>
              </div>
            );
          }

          return (
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isOutgoing ? 'rounded-br-sm' : 'rounded-bl-sm'
              }`}
              style={bubbleStyle}
            >
              {content}
            </div>
          );
        })()}

        {/* Reaction badges — grouped by emoji, counts reflect all reactors */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Array.from(
              reactions.reduce((acc, r) => {
                acc.set(r.emoji, (acc.get(r.emoji) ?? 0) + 1);
                return acc;
              }, new Map<string, number>()),
            ).map(([emoji, count]) => {
              const isMine = reactions.some((r) => r.emoji === emoji && r.userId === currentUserId);
              return (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`${emoji} reaction — ${count}. Click to ${isMine ? 'remove' : 'add'}.`}
                  onClick={() => onReact?.(emoji)}
                  className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-sm transition-opacity hover:opacity-70"
                  style={{
                    backgroundColor: isMine ? 'var(--ds-accent-bg-soft)' : 'var(--ds-bg-elevated)',
                    border: isMine
                      ? '1px solid var(--ds-accent-border)'
                      : '1px solid var(--ds-border-base)',
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                  <span
                    className="text-[10px] tabular-nums"
                    style={{ color: 'var(--ds-text-secondary)' }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp + delivery state */}
        <div className={`flex items-center gap-1 px-0.5 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
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
