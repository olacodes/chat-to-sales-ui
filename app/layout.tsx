import type { Metadata } from 'next';
import './globals.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'ChatToSales',
  description: 'Real-time conversational commerce dashboard',
};

// Tenant is read server-side from env and passed to the client provider.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WebSocketProvider tenantId={TENANT_ID}>{children}</WebSocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
