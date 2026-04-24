'use client';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState } from 'react';

// Cache survives for 24 h — covers NEPA outages and poor connectivity gaps
const CACHE_MAX_AGE = 1_000 * 60 * 60 * 24;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [{ queryClient, persister }] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          // gcTime must be >= maxAge so entries aren't GC'd before persister reads them
          gcTime: CACHE_MAX_AGE,
          refetchOnWindowFocus: true,
          retry: 1,
          retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 15_000),
        },
      },
    });

    const syncPersister = createSyncStoragePersister({
      // undefined on the server (SSR) — persister is a no-op in that case
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    });

    return { queryClient: client, persister: syncPersister };
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE, buster: 'v1' }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
