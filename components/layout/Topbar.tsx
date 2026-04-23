'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useWsStatus } from '@/lib/hooks/useWebSocket';
import { logout } from '@/lib/auth/service';
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

const GENERIC_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.es',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de',
  'outlook.com', 'outlook.co.uk', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'mail.com', 'yandex.com', 'gmx.com',
]);

/** Derive a business display name from an email address.
 * - Custom domain:  alice@acme-corp.com  →  "Acme Corp"
 * - Generic mailer: bob@gmail.com        →  "Bob"
 */
function businessNameFromEmail(email: string): string {
  const [prefix = '', domain = ''] = email.split('@');
  const raw = GENERIC_MAIL_DOMAINS.has(domain.toLowerCase()) ? prefix : (domain.split('.')[0] ?? prefix);
  return raw
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replaceAll('.', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Tenant Switcher ─────────────────────────────────────────── */

function TenantSwitcher() {
  const email = useAuthStore((s) => s.user?.email ?? '');
  const name = businessNameFromEmail(email) || 'My Workspace';

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

/* ── User menu with dropdown ─────────────────────────────────── */

/** Derive a readable display name from an email address. */
function nameFromEmail(email: string): string {
  const prefix = email.split('@')[0] ?? '';
  return prefix
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = user?.email ?? '';
  const displayName = nameFromEmail(email);
  const letters = (displayName.slice(0, 2) || email.slice(0, 2)).toUpperCase() || 'U';

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div ref={menuRef} className="relative ml-1">
      {/* Trigger button */}
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 transition-colors duration-150"
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
          {displayName || email}
        </span>
        {/* Chevron */}
        <svg
          className={`hidden md:block h-3 w-3 flex-shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--ds-bg-elevated)',
            border: '1px solid var(--ds-border-base)',
            boxShadow: 'var(--ds-shadow-lg)',
          }}
          role="menu"
        >
          {/* User info header */}
          <div
            className="px-3 py-2.5"
            style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
              {displayName || 'User'}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--ds-text-tertiary)' }}>
              {email}
            </p>
          </div>
          {/* Actions */}
          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors duration-150"
              style={{ color: 'var(--ds-danger-text)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-danger-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg
                className="h-3.5 w-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Topbar ──────────────────────────────────────────────────── */

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: Readonly<TopbarProps>) {
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
        <TenantSwitcher />

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

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
