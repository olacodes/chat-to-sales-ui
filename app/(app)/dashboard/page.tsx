'use client';

import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { TodayFocusPanel } from '@/components/dashboard/TodayFocusPanel';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { useOrders } from '@/hooks/useOrders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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
      {/* Colored accent bar — flush because Card already has overflow-hidden */}
      <div className="h-[3px] w-full" style={{ backgroundColor: iconColor }} />
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--ds-text-tertiary)' }}
            >
              {label}
            </p>
            <p
              className="mt-2.5 text-3xl font-bold tabular-nums leading-none"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              {value}
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              {sub}
            </p>
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MetricSkeleton() {
  return (
    <Card>
      <div
        className="h-[3px] w-full animate-pulse"
        style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
      />
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2.5">
            <div
              className="h-2.5 w-20 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-8 w-28 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
            <div
              className="h-2 w-16 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
            />
          </div>
          <div
            className="h-9 w-9 rounded-lg animate-pulse shrink-0"
            style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
          />
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ORDER_STATUS_BAR: Record<string, string> = {
  inquiry:   'bg-gray-300',
  pending:   'bg-amber-400',
  confirmed: 'bg-blue-400',
  paid:      'bg-indigo-400',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

const ORDER_STATUS_DOT: Record<string, string> = {
  inquiry:   'bg-gray-400',
  pending:   'bg-amber-400',
  confirmed: 'bg-blue-400',
  paid:      'bg-indigo-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

const ORDER_STATUSES = ['inquiry', 'pending', 'confirmed', 'paid', 'completed', 'cancelled'];

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, isError } = useDashboardOverview();
  const { data: orders = [] } = useOrders();

  const totalOrders       = overview?.totalOrders       ?? 0;
  const pendingOrders     = overview?.pendingOrders     ?? 0;
  const totalRevenue      = overview?.totalRevenue      ?? 0;
  const activeConvs       = overview?.activeConversations ?? 0;
  const conversionRate    = overview?.conversionRate    ?? 0;

  return (
    <div className="space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-6 py-5"
        style={{
          background: 'linear-gradient(135deg, var(--ds-brand-bg-soft) 0%, var(--ds-bg-surface) 65%)',
          border: '1px solid var(--ds-border-base)',
          boxShadow: 'var(--ds-shadow-xs)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--ds-brand-text)' }}
            >
              {getGreeting()}
            </p>
            <h1
              className="mt-1 text-2xl font-bold"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              Dashboard
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date())}
            </p>
          </div>

          {/* Quick-action chips */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/conversations"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--ds-brand-bg-soft)',
                color: 'var(--ds-brand-text)',
                border: '1px solid var(--ds-border-base)',
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              {overviewLoading ? '–' : activeConvs} conversations
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: 'var(--ds-accent-bg-soft)',
                color: 'var(--ds-accent-text)',
                border: '1px solid var(--ds-border-base)',
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 3H8l-1 4h10l-1-4z" />
              </svg>
              {overviewLoading ? '–' : pendingOrders} pending orders
            </Link>
          </div>
        </div>
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

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 3H8l-1 4h10l-1-4z" />
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              }
            />
            <MetricCard
              label="Active Conversations"
              value={activeConvs.toLocaleString()}
              sub="open or pending"
              iconBg="var(--ds-brand-bg-soft)"
              iconColor="var(--ds-brand-text)"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Today's Focus — prime column */}
        <div className="lg:col-span-2">
          <TodayFocusPanel />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Orders by status */}
          <Card>
            <CardHeader
              title="Orders by status"
              action={
                <Link
                  href="/orders"
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--ds-brand-text)' }}
                >
                  View all →
                </Link>
              }
            />

            {/* Stacked summary bar */}
            {orders.length > 0 && (
              <div className="px-5 pt-3 pb-1">
                <div className="flex h-2 w-full overflow-hidden rounded-full">
                  {ORDER_STATUSES.map((s) => {
                    const count = orders.filter((o) => o.status === s).length;
                    const pct = Math.round((count / orders.length) * 100);
                    if (pct === 0) return null;
                    return (
                      <div
                        key={s}
                        className={`h-full ${ORDER_STATUS_BAR[s] ?? 'bg-gray-300'}`}
                        style={{ width: `${pct}%` }}
                        title={`${s}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <CardBody>
              <ul className="space-y-2.5">
                {ORDER_STATUSES.map((s) => {
                  const count = orders.filter((o) => o.status === s).length;
                  const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${ORDER_STATUS_DOT[s]}`} />
                      <span
                        className="flex-1 text-xs font-medium capitalize"
                        style={{ color: 'var(--ds-text-secondary)' }}
                      >
                        {s}
                      </span>
                      <span
                        className="text-xs tabular-nums font-semibold"
                        style={{ color: 'var(--ds-text-primary)' }}
                      >
                        {count}
                      </span>
                      <span
                        className="text-xs tabular-nums w-8 text-right"
                        style={{ color: 'var(--ds-text-tertiary)' }}
                      >
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <SystemStatusCard />
        </div>
      </div>
    </div>
  );
}
