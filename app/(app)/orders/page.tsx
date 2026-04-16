'use client';

import { useState } from 'react';
import type { OrderStatus } from '@/store';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useOrders, useConfirmOrder, usePayOrder, useCompleteOrder } from '@/hooks/useOrders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type FilterState = 'all' | OrderStatus;

const FILTER_TABS: { label: string; value: FilterState }[] = [
  { label: 'All', value: 'all' },
  { label: 'Inquiry', value: 'inquiry' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Paid', value: 'paid' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_BADGE: Record<
  OrderStatus,
  { variant: 'warning' | 'info' | 'success' | 'default' | 'danger' | 'outline'; label: string }
> = {
  inquiry: { variant: 'outline', label: 'Inquiry' },
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'info', label: 'Confirmed' },
  paid: { variant: 'success', label: 'Paid' },
  completed: { variant: 'default', label: 'Completed' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-50" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-3 rounded bg-gray-100 animate-pulse" style={{ width: j === 0 ? '7rem' : j === 3 ? '4rem' : '5rem' }} />
            </td>
          ))}
          <td className="px-5 py-4">
            <div className="h-6 w-16 rounded bg-gray-100 animate-pulse" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError, error } = useOrders();

  const confirmOrder = useConfirmOrder();
  const payOrder = usePayOrder();
  const completeOrder = useCompleteOrder();

  const [filter, setFilter] = useState<FilterState>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ── Derived filterd list ──────────────────────────────────────────────────
  const filtered = orders.filter((order) => {
    if (filter !== 'all' && order.status !== filter) return false;

    const q = search.toLowerCase();
    if (q && !order.id.toLowerCase().includes(q) && !order.customerName.toLowerCase().includes(q))
      return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(order.createdAt) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(order.createdAt) > to) return false;
    }

    return true;
  });

  const countByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const hasDateFilter = Boolean(dateFrom || dateTo);

  function clearFilters() {
    setFilter('all');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading ? 'Loading…' : `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load orders: {error?.message ?? 'Unknown error'}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Search"
                placeholder="Order ID or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftElement={
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                }
              />
            </div>
            <div className="w-40">
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Input
                label="To"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(search || hasDateFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Order table */}
      <Card>
        {/* Status filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-5 pt-3 pb-0">
          {FILTER_TABS.map((tab) => {
            const count = tab.value === 'all' ? orders.length : (countByStatus[tab.value] ?? 0);
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-44">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                    Actions
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
                            d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 3H8l-1 4h10l-1-4z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No orders found</p>
                        {(search || hasDateFilter || filter !== 'all') && (
                          <button
                            type="button"
                            onClick={clearFilters}
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
                  {filtered.map((order) => {
                    const badge = STATUS_BADGE[order.status] ?? {
                      variant: 'default' as const,
                      label: order.status,
                    };

                    const isConfirming = confirmOrder.isPending && confirmOrder.variables === order.id;
                    const isPaying = payOrder.isPending && payOrder.variables === order.id;
                    const isCompleting = completeOrder.isPending && completeOrder.variables === order.id;
                    const busy = isConfirming || isPaying || isCompleting;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-semibold text-gray-700 truncate block max-w-[10rem]" title={order.id}>
                            {order.id}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                              {getInitials(order.customerName)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[10rem]" title={order.customerName}>
                              {order.customerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={badge.variant} dot>
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatCurrency(order.total, order.currency)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => confirmOrder.mutate(order.id)}
                              >
                                {isConfirming ? '…' : 'Confirm'}
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => payOrder.mutate(order.id)}
                              >
                                {isPaying ? '…' : 'Mark Paid'}
                              </Button>
                            )}
                            {order.status === 'paid' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => completeOrder.mutate(order.id)}
                              >
                                {isCompleting ? '…' : 'Complete'}
                              </Button>
                            )}
                            {(order.status === 'completed' || order.status === 'cancelled') && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
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
              Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` · ${FILTER_TABS.find((t) => t.value === filter)?.label}`}
              {hasDateFilter && ' · date filtered'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
