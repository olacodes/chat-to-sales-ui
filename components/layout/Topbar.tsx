'use client';

import { usePathname } from 'next/navigation';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import type { ConnectionStatus } from '@/lib/websocket/client';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const statusConfig: Record<ConnectionStatus, { label: string; color: string; pulse: boolean }> = {
  connected: { label: 'Live', color: 'var(--ds-success-dot)', pulse: false },
  connecting: { label: 'Connecting', color: 'var(--ds-warning-dot)', pulse: true },
  disconnected: { label: 'Offline', color: 'var(--ds-text-tertiary)', pulse: false },
  error: { label: 'Error', color: 'var(--ds-danger-dot)', pulse: false },
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/conversations': 'Conversations',
  '/orders': 'Orders',
  '/payments': 'Payments',
  '/customers': 'Customers',
  '/settings': 'Settings',
  '/test': 'Test Lab',
};

function getTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'ChatToSales';
}

/** Format the raw tenantId into a human-readable name. */
function formatTenantName(tenantId: string): string {
  return tenantId
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Tenant Switcher ─────────────────────────────────────────── */

function TenantSwitcher({ tenantId }: Readonly<{ tenantId: string }>) {
  const name = formatTenantName(tenantId);

  return (
    <button
      type="button"
      aria-label={`Current tenant: ${name}. Click to switch.`}
      title={`Tenant: ${name}`}
      className="hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 max-w-[160px]"
      style={{
        backgroundColor: 'var(--ds-bg-sunken)',
        color: 'var(--ds-text-secondary)',
        border: '1px solid var(--ds-border-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
        e.currentTarget.style.color = 'var(--ds-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--ds-bg-sunken)';
        e.currentTarget.style.color = 'var(--ds-text-secondary)';
      }}
    >
      {/* Building icon */}
      <svg
        className="h-3.5 w-3.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <span className="truncate">{name}</span>
      {/* Chevron — hints at switchability */}
      <svg
        className="h-3 w-3 flex-shrink-0 ml-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

/* ── User Profile button ─────────────────────────────────────── */

interface UserProfileProps {
  /** Display name — shown on md+ screens. */
  name: string;
  /** Email — shown as tooltip. */
  email: string;
  /** Two-letter initials, auto-derived when omitted. */
  initials?: string;
}

function UserProfile({ name, email, initials }: Readonly<UserProfileProps>) {
  const letters = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <button
      type="button"
      aria-label={`Account menu for ${name}`}
      title={email}
      className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 transition-colors duration-150 ml-1"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Avatar circle */}
      <span
        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          backgroundColor: 'var(--ds-brand-bg-soft)',
          color: 'var(--ds-brand-text)',
        }}
        aria-hidden="true"
      >
        {letters}
      </span>
      {/* Name — hidden on small screens */}
      <span
        className="hidden md:block text-xs font-medium"
        style={{ color: 'var(--ds-text-secondary)' }}
      >
        {name}
      </span>
    </button>
  );
}

/* ── Topbar ──────────────────────────────────────────────────── */

interface TopbarProps {
  onMenuClick: () => void;
  tenantId: string;
}

export function Topbar({ onMenuClick, tenantId }: Readonly<TopbarProps>) {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const wsStatus = useWsStatus();
  const { label, color, pulse } = statusConfig[wsStatus];

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center justify-between gap-3 px-4 lg:px-5"
      style={{
        backgroundColor: 'var(--ds-bg-surface)',
        borderBottom: '1px solid var(--ds-border-base)',
      }}
    >
      {/* ── Left: hamburger + tenant + page title ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Hamburger — mobile/tablet only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 flex-shrink-0"
          style={{ color: 'var(--ds-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Tenant switcher */}
        <TenantSwitcher tenantId={tenantId} />

        {/* Divider — only between tenant and title */}
        <div
          className="hidden sm:block h-4 w-px flex-shrink-0"
          style={{ backgroundColor: 'var(--ds-border-base)' }}
          aria-hidden="true"
        />

        {/* Page title */}
        <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--ds-text-primary)' }}>
          {title}
        </h1>
      </div>

      {/* ── Right: WS status + theme + bell + user ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* WebSocket live indicator */}
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 mr-1"
          style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          title={`WebSocket: ${label}`}
          aria-label={`WebSocket status: ${label}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${pulse ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: color }}
          />
          <span
            className="text-[11px] font-medium hidden sm:inline"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {label}
          </span>
        </div>

        {/* Dark / light mode toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: 'var(--ds-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Unread indicator */}
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--ds-danger-dot)' }}
          />
        </button>

        {/* User profile */}
        <UserProfile name="Admin" email="admin@chattosales.io" initials="AD" />
      </div>
    </header>
  );
}
