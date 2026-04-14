import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'ChatToSales',
  description: 'Real-time conversational commerce dashboard',
};

// Tenant is read server-side from env and passed to the client provider.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WebSocketProvider tenantId={TENANT_ID}>
          <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </WebSocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
