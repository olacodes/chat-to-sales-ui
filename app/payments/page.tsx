'use client';

import { useState } from 'react';
import type { PaymentStatus } from '@/store';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usePayments } from '@/hooks/usePayments';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FilterState = 'all' | PaymentStatus;

const FILTER_TABS: { label: string; value: FilterState }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

const STATUS_BADGE: Record<
  PaymentStatus,
  { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  paid: { variant: 'success', label: 'Paid' },
  pending: { variant: 'warning', label: 'Pending' },
  failed: { variant: 'danger', label: 'Failed' },
  refunded: { variant: 'default', label: 'Refunded' },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function truncateId(id: string): string {
  return id.length > 20 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

function truncateRef(ref: string): string {
  return ref.length > 24 ? `${ref.slice(0, 11)}…${ref.slice(-8)}` : ref;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div
                className="h-3 rounded bg-gray-100 animate-pulse"
                style={{ width: j === 0 ? '6rem' : j === 2 ? '3.5rem' : j === 1 ? '7rem' : '5rem' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

function SummaryCard({ label, value, sub, color = 'text-gray-900' }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { data: payments = [], isLoading, isError, error } = usePayments();

  const [filter, setFilter] = useState<FilterState>('all');
  const [search, setSearch] = useState('');

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = payments.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    const q = search.toLowerCase();
    if (
      q &&
      !p.id.toLowerCase().includes(q) &&
      !p.orderId.toLowerCase().includes(q) &&
      !(p.reference ?? '').toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const countByStatus = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const paidCount = countByStatus['paid'] ?? 0;
  const pendingCount = countByStatus['pending'] ?? 0;
  const displayCurrency = payments[0]?.currency ?? 'USD';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading
            ? 'Loading…'
            : `${payments.length} transaction${payments.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load payments: {error?.message ?? 'Unknown error'}
        </div>
      )}

      {/* Summary row */}
      {!isLoading && payments.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            label="Total collected"
            value={formatCurrency(totalPaid, displayCurrency)}
            sub={`${paidCount} payment${paidCount !== 1 ? 's' : ''}`}
            color="text-green-600"
          />
          <SummaryCard
            label="Pending"
            value={formatCurrency(totalPending, displayCurrency)}
            sub={`${pendingCount} awaiting`}
            color="text-amber-600"
          />
          <SummaryCard
            label="Failed"
            value={String(countByStatus['failed'] ?? 0)}
            sub="transactions"
            color="text-red-600"
          />
          <SummaryCard
            label="Refunded"
            value={String(countByStatus['refunded'] ?? 0)}
            sub="transactions"
          />
        </div>
      )}

      {/* Table card */}
      <Card>
        {/* Toolbar */}
        <div className="flex items-center gap-4 px-5 pt-4 pb-2">
          <div className="w-64">
            <Input
              placeholder="Search ID, order or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftElement={
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              }
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-5 pb-0">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === 'all' ? payments.length : (countByStatus[tab.value] ?? 0);
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={[
                  'flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab.label}
                <span
                  className={[
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                    Payment ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Reference
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                    Linked Order
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">
                    Date
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg
                          className="h-10 w-10 text-gray-300 mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No payments found</p>
                        {(search || filter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => { setSearch(''); setFilter('all'); }}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((payment) => {
                    const { variant, label } = STATUS_BADGE[payment.status] ?? {
                      variant: 'default' as const,
                      label: payment.status,
                    };
                    const dateIso = payment.paidAt ?? payment.createdAt;

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        {/* Payment ID */}
                        <td className="px-5 py-3.5">
                          <span
                            className="font-mono text-xs font-semibold text-gray-700"
                            title={payment.id}
                          >
                            {truncateId(payment.id)}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="px-5 py-3.5">
                          {payment.reference ? (
                            <span
                              className="font-mono text-xs text-gray-600 bg-gray-100 rounded px-1.5 py-0.5"
                              title={payment.reference}
                            >
                              {truncateRef(payment.reference)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <Badge variant={variant} dot>
                            {label}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={[
                              'text-sm font-semibold tabular-nums',
                              payment.status === 'refunded'
                                ? 'text-gray-400 line-through'
                                : payment.status === 'failed'
                                  ? 'text-red-400'
                                  : 'text-gray-900',
                            ].join(' ')}
                          >
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </td>

                        {/* Linked order */}
                        <td className="px-5 py-3.5">
                          <a
                            href="/orders"
                            className="inline-flex items-center gap-1 font-mono text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[8rem]"
                            title={`View order ${payment.orderId}`}
                          >
                            {truncateId(payment.orderId)}
                            <svg
                              className="h-3 w-3 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </a>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(dateIso)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
        </CardBody>

        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {payments.length} transaction
              {payments.length !== 1 ? 's' : ''}
              {filter !== 'all' &&
                ` · ${FILTER_TABS.find((t) => t.value === filter)?.label}`}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
