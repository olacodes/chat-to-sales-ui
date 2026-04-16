import type { Metadata } from 'next';
import './globals.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider, THEME_STORAGE_KEY } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'ChatToSales',
  description: 'Real-time conversational commerce dashboard',
};

// Tenant is read server-side from env and passed to the client provider.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default';

/**
 * Anti-flash script — runs synchronously before React hydration so the correct
 * `.dark` class is on <html> before the first paint. This eliminates the white
 * flash that would otherwise appear for users who prefer dark mode.
 *
 * The key must match THEME_STORAGE_KEY exported from ThemeProvider.tsx.
 */
const antiFlashScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
     * suppressHydrationWarning — React will see a class mismatch on <html>
     * between server ('') and client (possibly 'dark', set by the inline
     * script). This prop tells React to accept the mismatch silently on this
     * single element without propagating to children.
     */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <WebSocketProvider tenantId={TENANT_ID}>{children}</WebSocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
