'use client';

import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { TodayFocusPanel } from '@/components/dashboard/TodayFocusPanel';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { useOrders } from '@/hooks/useOrders';
import { useChannels } from '@/hooks/useChannels';

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
  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const whatsappConnected = channels.some((c) => c.channel === 'whatsapp');

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

      {/* WhatsApp connect prompt — shown until the trader connects their own number */}
      {!channelsLoading && !whatsappConnected && (
        <div
          className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, var(--ds-success-bg) 0%, var(--ds-bg-surface) 100%)',
            border: '1px solid var(--ds-success-border, var(--ds-border-base))',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--ds-success-bg)' }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ fill: 'var(--ds-success-text)' }} aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.868.518 3.614 1.42 5.113L2 22l5.01-1.391A9.946 9.946 0 0 0 12.004 22C17.525 22 22 17.521 22 12.004 22 6.479 17.525 2 12.004 2zm0 18.16a8.12 8.12 0 0 1-4.178-1.15l-.299-.178-3.094.858.874-3.02-.194-.31a8.144 8.144 0 0 1-1.269-4.356c0-4.512 3.672-8.184 8.184-8.184 4.51 0 8.18 3.672 8.18 8.184 0 4.511-3.67 8.157-8.204 8.157z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
                Connect your WhatsApp number
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                Let customers order directly from your number — no middleman.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#25D366', color: '#fff' }}
          >
            Connect →
          </Link>
        </div>
      )}

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
