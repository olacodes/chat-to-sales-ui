'use client';

import { usePathname } from 'next/navigation';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import type { ConnectionStatus } from '@/lib/websocket/client';

const statusDot: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: 'bg-green-500', label: 'Connected' },
  connecting: { color: 'bg-amber-400 animate-pulse', label: 'Connecting…' },
  disconnected: { color: 'bg-gray-400', label: 'Disconnected' },
  error: { color: 'bg-red-500', label: 'Connection error' },
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/conversations': 'Conversations',
  '/orders': 'Orders',
  '/payments': 'Payments',
  '/test': 'Test Lab',
};

function getTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'ChatToSales';
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const wsStatus = useWsStatus();
  const dot = statusDot[wsStatus];

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>

      <div className="flex items-center gap-3">
        {/* WebSocket status */}
        <div
          title={dot.label}
          aria-label={`WebSocket: ${dot.label}`}
          className="flex items-center gap-1.5"
        >
          <span className={`h-2 w-2 rounded-full ${dot.color}`} />
          <span className="hidden text-xs text-gray-500 sm:inline">{dot.label}</span>
        </div>
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Unread badge */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
