'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Pre-defined quick reply chips shown above input. */
  quickReplies?: string[];
  /** Show spinner on send button while message is in-flight. */
  isSending?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
  quickReplies,
  isSending = false,
}: Readonly<ChatInputProps>) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isSending;
  const canSend = value.trim().length > 0 && !isDisabled;

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue('');
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
