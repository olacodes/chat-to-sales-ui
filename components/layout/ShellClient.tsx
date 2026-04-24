'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OfflineBanner } from './OfflineBanner';
import { restoreSession } from '@/lib/auth/service';

/**
 * ShellClient manages the sidebar open/close state and renders the
 * application chrome: Sidebar + Topbar + scrollable main area.
 *
 * Kept as a dedicated client component so that app/(app)/layout.tsx
 * can remain a server component, preserving streaming and RSC benefits.
 *
 * tenantId — read from NEXT_PUBLIC_TENANT_ID in the (app) layout and passed
 * here so the Topbar tenant switcher can display the current tenant.
 */

interface ShellClientProps {
  children: React.ReactNode;
}

export function ShellClient({ children }: Readonly<ShellClientProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore JWT from sessionStorage into memory on page reload.
  // The middleware already verified the presence cookie, so we just
  // need to repopulate the in-memory token for API calls.
  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <OfflineBanner />
        <main
          className="flex-1 overflow-y-auto scrollbar-thin p-6"
          style={{ backgroundColor: 'var(--ds-bg-base)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
