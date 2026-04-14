'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
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
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-shadow">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-[10px] text-gray-400">Shift+Enter for new line</p>
    </div>
  );
}
