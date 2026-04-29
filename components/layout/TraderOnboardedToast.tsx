'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface TraderOnboardedToastProps {
  businessName: string;
  slug: string;
  onDismiss: () => void;
}

/** Auto-dismissing toast shown when a trader completes onboarding. */
export function TraderOnboardedToast({
  businessName,
  slug,
  onDismiss,
}: Readonly<TraderOnboardedToastProps>) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5_000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        backgroundColor: 'var(--ds-bg-inverse)',
        color: 'var(--ds-text-inverse)',
        boxShadow: 'var(--ds-shadow-md)',
        maxWidth: '360px',
      }}
    >
      <span aria-hidden="true" className="shrink-0 text-base">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug">Store is live!</p>
        <p className="mt-0.5 text-xs opacity-80 truncate">{businessName}</p>
      </div>
      <Link
        href={`/store/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--ds-brand-bg)', color: '#fff' }}
        onClick={onDismiss}
      >
        View
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-inherit"
      >
        ×
      </button>
    </div>
  );
}
