'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Generic hook for calling an API function on mount (and on manual refetch).
 *
 * @example
 * const { data, loading, error, refetch } = useApi(() => healthApi.check());
 */
export function useApi<T>(fn: (signal: AbortSignal) => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Stable reference so the effect dep array stays clean
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [tick, setTick] = useState(0);

  const execute = useCallback(() => {
    const controller = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fnRef
      .current(controller.signal)
      .then((data) => {
        setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message =
          err instanceof ApiError
            ? `${err.body.message}${err.body.code ? ` (${err.body.code})` : ''}`
            : err instanceof Error
              ? err.message
              : 'Unknown error';
        setState({ data: null, loading: false, error: message });
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = execute();
    return cleanup;
    // tick drives manual refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, refetch };
}
