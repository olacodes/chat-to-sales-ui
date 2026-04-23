'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Message } from '@/store';
import { SnoozePopover } from './SnoozePopover';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Pre-defined quick reply chips shown above input. */
  quickReplies?: string[];
  /** Show spinner on send button while message is in-flight. */
  isSending?: boolean;
  /** When set, shows a reply-to preview bar above the input. */
  replyTo?: Message | null;
  /** Called when the user dismisses the reply-to bar. */
  onCancelReply?: () => void;
  /** Called when user picks a schedule preset. Only shown when text is present. */
  onSchedule?: (content: string, scheduledFor: string) => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  quickReplies,
  isSending = false,
  replyTo,
  onCancelReply,
  onSchedule,
}: Readonly<ChatInputProps>) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isSending;
  const canSend = value.trim().length > 0 && !isDisabled;

  // Auto-focus the textarea when a reply is set
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;

    let content = trimmed;
    if (replyTo) {
      const senderLabel = replyTo.role === 'user' ? 'Customer' : 'Agent';
      const raw = replyTo.content;
      const excerpt = raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
      content = `> ${senderLabel}: ${excerpt}\n\n${trimmed}`;
    }
    onSend(content);
    setValue('');
    onCancelReply?.();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div
      className="flex-shrink-0 px-4 py-3"
      style={{
        borderTop: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
      }}
    >
      {/* Reply-to preview bar */}
      {replyTo && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2"
          style={{
            backgroundColor: 'var(--ds-bg-sunken)',
            borderLeft: '3px solid var(--ds-brand-bg)',
          }}
        >
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-semibold mb-0.5"
              style={{ color: 'var(--ds-brand-text)' }}
            >
              {replyTo.role === 'user' ? 'Customer' : 'Agent'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--ds-text-secondary)' }}>
              {replyTo.content}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={onCancelReply}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-base transition-opacity hover:opacity-70"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            ×
          </button>
        </div>
      )}
      {/* Quick reply chips */}
      {quickReplies && quickReplies.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2 mb-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSend(reply)}
              disabled={isDisabled}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-150 disabled:opacity-50"
              style={{
                borderColor: 'var(--ds-border-base)',
                color: 'var(--ds-text-secondary)',
                backgroundColor: 'var(--ds-bg-surface)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
                e.currentTarget.style.color = 'var(--ds-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-bg-surface)';
                e.currentTarget.style.color = 'var(--ds-text-secondary)';
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div
        className="flex items-end gap-2 rounded-xl px-3 py-2 transition-shadow duration-150"
        style={{
          border: `1px solid ${focused ? 'var(--ds-border-focus)' : 'var(--ds-border-base)'}`,
          backgroundColor: 'var(--ds-bg-sunken)',
          boxShadow: focused
            ? `0 0 0 3px color-mix(in srgb, var(--ds-brand-bg) 15%, transparent)`
            : 'none',
        }}
      >
        {/* Emoji trigger */}
        <button
          type="button"
          aria-label="Add emoji"
          disabled={isDisabled}
          className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base transition-colors duration-100 disabled:opacity-40"
          style={{ color: 'var(--ds-text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
        >
          😊
        </button>

        {/* Attachment trigger */}
        <button
          type="button"
          aria-label="Attach file"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
          className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-100 disabled:opacity-40"
          style={{ color: 'var(--ds-text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isDisabled}
          placeholder="Type a message…"
          aria-label="Message input"
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
          style={{
            color: 'var(--ds-text-primary)',
            minHeight: '24px',
            maxHeight: '120px',
          }}
        />

        {/* Schedule button — only visible when there is text and onSchedule is provided */}
        {onSchedule && (
          <div className="relative mb-0.5 group/sched-tip">
            <button
              type="button"
              aria-label="Schedule message"
              disabled={!canSend}
              onClick={() => setScheduleOpen((o) => !o)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--ds-text-tertiary)' }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.color = 'var(--ds-text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ds-text-tertiary)'; }}
            >
              {/* Calendar icon — schedule message */}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {canSend && (
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium opacity-0 transition-opacity group-hover/sched-tip:opacity-100 z-50"
                style={{ backgroundColor: 'var(--ds-bg-inverted, #111)', color: 'var(--ds-text-inverse, #fff)' }}>
                Schedule message
              </span>
            )}
            {scheduleOpen && canSend && (
              <SnoozePopover
                direction="up"
                onSelect={(iso) => {
                  onSchedule(value.trim(), iso);
                  setValue('');
                  setScheduleOpen(false);
                  if (textareaRef.current) textareaRef.current.style.height = 'auto';
                }}
                onClose={() => setScheduleOpen(false)}
              />
            )}
          </div>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--ds-brand-bg)' }}
          onMouseEnter={(e) => {
            if (canSend) e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-hover)';
          }}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg)')}
        >
          {isSending ? (
            /* Spinner */
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            /* Send icon */
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Hint */}
      <p
        className="mt-1.5 text-[10px] hidden sm:block"
        style={{ color: 'var(--ds-text-tertiary)' }}
      >
        Shift+Enter for new line
      </p>
    </div>
  );
}
