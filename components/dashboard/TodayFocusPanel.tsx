'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { useTodayFocus } from '@/hooks/useDashboard';
import type { TodayFocusItem, FocusUrgency } from '@/lib/api/endpoints/dashboard';

// ─── Urgency config ───────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<
  FocusUrgency,
  {
    label: string;
    badgeVariant: 'danger' | 'warning' | 'info';
    stripColor: string;
    actionLabel: string;
  }
> = {
  overdue: {
    label: 'Overdue',
    badgeVariant: 'danger',
    stripColor: 'var(--ds-danger-text)',
    actionLabel: 'Follow up',
  },
  waiting: {
    label: 'Waiting',
    badgeVariant: 'warning',
    stripColor: 'var(--ds-warning-text)',
    actionLabel: 'Reply',
  },
  follow_up: {
    label: 'Follow up',
    badgeVariant: 'info',
    stripColor: 'var(--ds-info-text)',
    actionLabel: 'Follow up',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatWaiting(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FocusSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div
            className="w-1 h-10 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 w-3/4 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-2.5 w-1/4 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
          </div>
          <div
            className="h-6 w-16 rounded-lg animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
        </div>
      ))}
    </>
  );
}

// ─── Single focus item ────────────────────────────────────────────────────────

function FocusRow({ item }: { item: TodayFocusItem }) {
  const cfg = URGENCY_CONFIG[item.urgency];
  const href = `/conversations/${item.conversationId}`;
  const waited = formatWaiting(item.since);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      {/* urgency strip */}
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: cfg.stripColor }}
        aria-hidden="true"
      />

      {/* content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--ds-text-primary)' }}
        >
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant={cfg.badgeVariant} dot>
            {cfg.label}
          </Badge>
          <span className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
            {waited} waiting
          </span>
        </div>
      </div>

      {/* action */}
      <Link
        href={href}
        className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--ds-bg-sunken)',
          color: 'var(--ds-text-secondary)',
        }}
      >
        {cfg.actionLabel} →
      </Link>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function TodayFocusPanel() {
  const { data: items = [], isLoading } = useTodayFocus();
  const count = items.length;

  return (
    <Card>
      <CardHeader
        title="Today's Focus"
        description="Actions that need your attention right now"
        action={
          count > 0 ? (
            <Badge variant={items.some((i) => i.urgency === 'overdue') ? 'danger' : 'warning'}>
              {count} {count === 1 ? 'item' : 'items'}
            </Badge>
          ) : undefined
        }
      />

      <div className="divide-y" style={{ borderColor: 'var(--ds-border-subtle)' }}>
        {isLoading ? (
          <FocusSkeleton />
        ) : count === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>
              You&apos;re all caught up
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              No pending actions — keep it up
            </p>
          </div>
        ) : (
          items.map((item) => <FocusRow key={item.id} item={item} />)
        )}
      </div>
    </Card>
  );
}
