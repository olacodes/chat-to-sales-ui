'use client';

import { useState } from 'react';

/**
 * Error state components:
 *
 *   ErrorState   — centered page/section-level error with optional retry button.
 *   ErrorBanner  — dismissible top-of-form error strip for API errors.
 */

/* ── ErrorState ─────────────────────────────────────────────── */

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Couldn't load this content",
  description = "Something went wrong on our end. This isn't your fault.",
  onRetry,
  className = '',
}: Readonly<ErrorStateProps>) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-14 px-8 text-center ${className}`}
    >
      {/* Warning icon */}
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          backgroundColor: 'var(--ds-warning-bg)',
          color: 'var(--ds-warning-dot)',
        }}
        aria-hidden="true"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
        {title}
      </h3>

      <p
        className="mt-1.5 text-sm max-w-xs leading-relaxed"
        style={{ color: 'var(--ds-text-secondary)' }}
      >
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border transition-colors duration-150"
          style={{
            color: 'var(--ds-text-primary)',
            borderColor: 'var(--ds-border-base)',
            backgroundColor: 'var(--ds-bg-surface)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-surface)')}
        >
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}

/* ── ErrorBanner ─────────────────────────────────────────────── */

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Readonly<ErrorBannerProps>) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in"
      style={{
        backgroundColor: 'var(--ds-danger-bg)',
        borderColor: 'var(--ds-danger-border)',
        color: 'var(--ds-danger-text)',
      }}
    >
      {/* Icon */}
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>

      <p className="flex-1 leading-snug">{message}</p>

      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss error"
          onClick={dismiss}
          className="shrink-0 opacity-60 transition-opacity duration-100 hover:opacity-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
