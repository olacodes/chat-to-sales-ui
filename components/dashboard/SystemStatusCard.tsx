'use client';

import { healthApi } from '@/lib/api';
import { useApi } from '@/lib/hooks/useApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function SystemStatusCard() {
  const { data, loading, error, refetch } = useApi((signal) => healthApi.check(signal));

  const variant =
    data?.status === 'ok'
      ? 'success'
      : data?.status === 'degraded'
        ? 'warning'
        : error
          ? 'danger'
          : 'default';

  const label = loading ? 'checking…' : (data?.status ?? 'unknown');

  return (
    <Card>
      <CardHeader
        title="System Status"
        action={
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            {loading ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </Button>
        }
      />
      <CardBody>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--ds-text-primary)' }}>
                API
              </span>
              <Badge variant={variant} dot>
                {label}
              </Badge>
            </li>
            {data && (
              <>
                <li className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--ds-text-primary)' }}>
                    Version
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--ds-text-secondary)' }}>
                    {data.version}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--ds-text-primary)' }}>
                    Uptime
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                    {Math.floor(data.uptime / 60)}m
                  </span>
                </li>
              </>
            )}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
