'use client';

import { useEffect, useState } from 'react';
import { useWsStatus } from '@/lib/hooks/useWebSocket';

export function OfflineBanner() {
  const wsStatus = useWsStatus();
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Sync with actual network state on mount
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 2_500);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Brief "Back online" confirmation after reconnecting
  if (showBackOnline && wsStatus === 'connected') {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--ds-success-dot)',
          color: '#fff',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
        Back online
      </div>
    );
  }

  // Network is down
  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--ds-warning-dot)',
          color: '#fff',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
        You&apos;re offline &middot; Showing cached data
      </div>
    );
  }

  // Network is fine but WebSocket lost its connection
  if (wsStatus === 'disconnected' || wsStatus === 'error') {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--ds-warning-dot)',
          color: '#fff',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80 animate-pulse" />
        Connection lost &middot; Reconnecting&hellip;
      </div>
    );
  }

  // WebSocket is in the process of connecting
  if (wsStatus === 'connecting') {
    return (
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          color: 'var(--ds-text-secondary)',
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--ds-warning-dot)' }} />
        Connecting&hellip;
      </div>
    );
  }

  return null;
}
