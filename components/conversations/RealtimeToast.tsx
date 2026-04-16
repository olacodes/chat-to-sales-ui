'use client';

import { useEffect } from 'react';
import type { RealtimeActivity } from '@/lib/hooks/useConversationsRealtime';

const icons: Record<RealtimeActivity['type'], string> = {
  MessageReceived: '💬',
  OrderStateChanged: '📦',
  PaymentConfirmed: '💳',
};

interface RealtimeToastProps {
  activity: RealtimeActivity | null;
  onDismiss: () => void;
}

/**
 * A lightweight auto-dismissing toast for real-time events.
 * Auto-dismisses after 3 s.
 */
export function RealtimeToast({ activity, onDismiss }: Readonly<RealtimeToastProps>) {
  useEffect(() => {
    if (!activity) return;
    const timer = setTimeout(onDismiss, 3_000);
    return () => clearTimeout(timer);
  }, [activity, onDismiss]);

  if (!activity) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: 'var(--ds-bg-inverse)',
        color: 'var(--ds-text-inverse)',
        boxShadow: 'var(--ds-shadow-md)',
      }}
    >
      <span aria-hidden="true">{icons[activity.type]}</span>
      <span>{activity.label}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-inherit"
      >
        ×
      </button>
    </div>
  );
}
