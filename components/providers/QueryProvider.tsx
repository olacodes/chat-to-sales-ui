'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session — useState ensures it is not re-created
  // on every render and is not shared across requests in SSR.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 s; won't refetch until stale
            staleTime: 30_000,
            // Refetch when the tab re-gains focus (great for chat UX)
            refetchOnWindowFocus: true,
            // Retry once on network failures before surfacing the error
            retry: 1,
            retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 15_000),
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
