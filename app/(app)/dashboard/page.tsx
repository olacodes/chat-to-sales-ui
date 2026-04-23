'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { useDashboardOverview, useRecentActivity } from '@/hooks/useDashboard';
import { useOrders } from '@/hooks/useOrders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ label, value, sub, icon, iconBg, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              {label}
            </p>
            <p
              className="mt-2 text-2xl font-bold tabular-nums"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              {value}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              {sub}
            </p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function MetricSkeleton() {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div
              className="h-2.5 w-20 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-7 w-28 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-2 w-16 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
          </div>
          <div
            className="h-10 w-10 rounded-xl animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <div
            className="h-8 w-8 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 w-2/3 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-2.5 w-1/3 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
          </div>
          <div
            className="h-2.5 w-10 rounded animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
        </div>
      ))}
    </>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

import type { ActivityKind, DashboardActivityItem } from '@/lib/api/endpoints/dashboard';

// ─── Activity components ───────────────────────────────────────────────────────

function ActivityIcon({ kind }: { kind: ActivityKind }) {
  if (kind === 'order')
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: 'var(--ds-accent-bg-soft)', color: 'var(--ds-accent-text)' }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 3H8l-1 4h10l-1-4z"
          />
        </svg>
      </div>
    );
  if (kind === 'payment')
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z"
          />
        </svg>
      </div>
    );
  if (kind === 'conversation')
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: 'var(--ds-brand-bg-soft)', color: 'var(--ds-brand-text)' }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </div>
    );
  // message / generic
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
      style={{ backgroundColor: 'var(--ds-bg-sunken)', color: 'var(--ds-text-secondary)' }}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
        />
      </svg>
    </div>
  );
}

function ActivityRow({ item }: { item: DashboardActivityItem }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <ActivityIcon kind={item.kind} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--ds-text-primary)' }}>
            {item.title}
          </p>
          <span className="text-xs shrink-0" style={{ color: 'var(--ds-text-tertiary)' }}>
            {formatRelative(item.timestamp)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {item.status && (
            <Badge variant="outline" dot>
              {item.status}
            </Badge>
          )}
          {item.subtitle && (
            <span className="text-xs truncate" style={{ color: 'var(--ds-text-secondary)' }}>
              {item.subtitle}
            </span>
          )}
          {item.amount != null && (
            <span className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              {formatCurrency(item.amount, item.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-gray-300',
  pending: 'bg-amber-400',
  confirmed: 'bg-blue-400',
  paid: 'bg-indigo-400',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, isError } = useDashboardOverview();
  const { data: activity = [], isLoading: activityLoading } = useRecentActivity();
  const { data: orders = [] } = useOrders();

  const totalOrders = overview?.totalOrders ?? 0;
  const pendingOrders = overview?.pendingOrders ?? 0;
  const totalRevenue = overview?.totalRevenue ?? 0;
  const activeConversations = overview?.activeConversations ?? 0;
  const conversionRate = overview?.conversionRate ?? 0;

  const orderStatuses = ['inquiry', 'pending', 'confirmed', 'paid', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date())}
        </p>
      </div>

      {/* Error banner */}
      {isError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
        >
          Could not load dashboard metrics. Data shown may be incomplete.
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Orders"
              value={totalOrders.toLocaleString()}
              sub={`${pendingOrders} pending fulfilment`}
              iconBg="var(--ds-accent-bg-soft)"
              iconColor="var(--ds-accent-text)"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 3H8l-1 4h10l-1-4z"
                  />
                </svg>
              }
            />
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(totalRevenue)}
              sub="from paid orders"
              iconBg="var(--ds-brand-bg-soft)"
              iconColor="var(--ds-brand-text)"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  />
                </svg>
              }
            />
            <MetricCard
              label="Active Conversations"
              value={activeConversations.toLocaleString()}
              sub="open or pending"
              iconBg="var(--ds-brand-bg-soft)"
              iconColor="var(--ds-brand-text)"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              }
            />
            <MetricCard
              label="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              sub="conversations → orders"
              iconBg="var(--ds-warning-bg)"
              iconColor="var(--ds-warning-text)"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                  />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent activity feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Activity"
              description="Latest events from your account"
              action={
                <Link
                  href="/orders"
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--ds-accent-text)' }}
                >
                  View orders →
                </Link>
              }
            />
            <div className="divide-y px-5" style={{ borderColor: 'var(--ds-border-subtle)' }}>
              {activityLoading ? (
                <ActivitySkeleton />
              ) : activity.length === 0 ? (
                <p
                  className="py-10 text-center text-sm"
                  style={{ color: 'var(--ds-text-tertiary)' }}
                >
                  No activity yet
                </p>
              ) : (
                activity.slice(0, 7).map((item) => <ActivityRow key={item.id} item={item} />)
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order breakdown */}
          <Card>
            <CardHeader title="Orders by status" />
            <div className="px-5 pb-4 pt-3 space-y-2.5">
              {orderStatuses.map((s) => {
                const count = orders.filter((o) => o.status === s).length;
                const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-medium capitalize"
                        style={{ color: 'var(--ds-text-secondary)' }}
                      >
                        {s}
                      </span>
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: 'var(--ds-text-secondary)' }}
                      >
                        {count} · {pct}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
                    >
                      <div
                        className={`h-1.5 rounded-full ${ORDER_STATUS_COLORS[s] ?? 'bg-gray-300'} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <SystemStatusCard />
        </div>
      </div>
    </div>
  );
}
