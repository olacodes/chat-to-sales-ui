'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { logout } from '@/lib/auth/service';
import { AppIcon } from '@/components/ui/AppIcon';
import type { Route } from 'next';

interface SidebarProps {
  /** Controls drawer visibility on mobile (< lg). */
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  {
    label: 'Conversations',
    href: '/conversations',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Credit',
    href: '/credit',
    icon: (active) => (
      <svg
        className="w-[18px] h-[18px]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2 : 1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  ...(process.env.NODE_ENV === 'production'
    ? []
    : [
        {
          label: 'Test Lab',
          href: '/test',
          icon: (active: boolean) => (
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={active ? 2 : 1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-3.432 3.432a2.25 2.25 0 01-3.182 0L9.768 15m10.032 0a24.156 24.156 0 00-10.032 0"
              />
            </svg>
          ),
        },
      ]),
];

export function Sidebar({ isOpen, onClose }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const email = user?.email ?? '';
  const isSynthetic = email.includes('@wa.chattosales');
  const displayName = isSynthetic
    ? `+${email.split('@')[0]}`
    : email
        .split('@')[0]
        .replaceAll('.', ' ')
        .replaceAll('_', ' ')
        .replaceAll(/\b\w/g, (c) => c.toUpperCase());
  const letters = (displayName.replace('+', '').slice(0, 2) || 'U').toUpperCase();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <>
      {/* Scrim — mobile only, shown when drawer is open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'flex flex-shrink-0 flex-col',
          // Mobile: fixed overlay drawer
          'fixed inset-y-0 left-0 z-50 w-72',
          // Desktop: static in layout flow, narrower
          'lg:relative lg:z-auto lg:w-56',
          // Slide in/out
          'transition-transform duration-[250ms] ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="Main navigation"
        style={{
          backgroundColor: 'var(--ds-sidebar-bg)',
          borderRight: '1px solid var(--ds-sidebar-border)',
        }}
      >
        {/* Brand mark + mobile close button */}
        <div
          className="flex h-14 items-center gap-1.5 px-4"
          style={{ borderBottom: '1px solid var(--ds-sidebar-border)' }}
        >
          <Link href="/" className="flex items-center gap-1.5 flex-1 min-w-0">
            <AppIcon size={28} />
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              ChatToSales
            </span>
          </Link>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-100"
            style={{ color: 'var(--ds-text-tertiary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-item"
                data-active={isActive || undefined}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--ds-sidebar-item-active-bg)',
                        color: 'var(--ds-sidebar-item-active-text)',
                      }
                    : undefined
                }
              >
                <span
                  className="shrink-0"
                  style={{
                    color: isActive
                      ? 'var(--ds-sidebar-item-active-icon)'
                      : 'var(--ds-sidebar-item-icon)',
                  }}
                >
                  {item.icon(isActive)}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section — settings + user */}
        <div
          className="p-2 space-y-0.5"
          style={{ borderTop: '1px solid var(--ds-sidebar-border)' }}
        >
          {/* Settings */}
          <Link
            href={'/settings' as Route}
            className="sidebar-item"
            data-active={pathname === '/settings' || undefined}
            style={
              pathname === '/settings'
                ? {
                    backgroundColor: 'var(--ds-sidebar-item-active-bg)',
                    color: 'var(--ds-sidebar-item-active-text)',
                  }
                : undefined
            }
          >
            <span
              style={{
                color:
                  pathname === '/settings'
                    ? 'var(--ds-sidebar-item-active-icon)'
                    : 'var(--ds-sidebar-item-icon)',
              }}
            >
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={pathname === '/settings' ? 2 : 1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            <span>Settings</span>
          </Link>

          {/* User card + logout */}
          <div
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 mt-1"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: 'var(--ds-brand-bg-soft)',
                color: 'var(--ds-brand-text)',
              }}
            >
              {letters}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--ds-text-primary)' }}
              >
                {displayName || 'User'}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--ds-text-tertiary)' }}>
                {email}
              </p>
            </div>
            {/* Logout icon button */}
            <button
              type="button"
              aria-label="Sign out"
              onClick={handleLogout}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
              style={{ color: 'var(--ds-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ds-danger-bg)';
                e.currentTarget.style.color = 'var(--ds-danger-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ds-text-tertiary)';
              }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
