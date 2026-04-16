'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

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
  tenantId: string;
}

export function ShellClient({ children, tenantId }: Readonly<ShellClientProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} tenantId={tenantId} />
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
