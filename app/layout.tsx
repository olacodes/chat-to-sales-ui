import type { Metadata } from 'next';
import './globals.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider, THEME_STORAGE_KEY } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'ChatToSales',
  description: 'Real-time conversational commerce dashboard',
};

// Tenant identity is resolved after login via the auth store — no env var needed here.

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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
