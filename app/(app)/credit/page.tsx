'use client';

import { useState } from 'react';
import { useCreditSales, useSettleCreditSale, useDisputeCreditSale, useSendCreditReminder } from '@/hooks/useCreditSales';
import type { CreditSale, CreditSaleStatus } from '@/store';

const STATUS_STYLES: Record<CreditSaleStatus, { bg: string; text: string; label: string }> = {
  active: { bg: 'var(--ds-warning-bg)', text: 'var(--ds-warning-text)', label: 'Active' },
  settled: { bg: 'var(--ds-success-bg)', text: 'var(--ds-success-text)', label: 'Settled' },
  disputed: { bg: 'var(--ds-danger-bg)', text: 'var(--ds-danger-text)', label: 'Disputed' },
  written_off: { bg: 'var(--ds-bg-elevated)', text: 'var(--ds-text-tertiary)', label: 'Written off' },
};

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function CreditRow({ sale }: { sale: CreditSale }) {
  const { mutate: settle, isPending: isSettling } = useSettleCreditSale();
  const { mutate: dispute, isPending: isDisputing } = useDisputeCreditSale();
  const { mutate: remind, isPending: isReminding } = useSendCreditReminder();

  const style = STATUS_STYLES[sale.status];
  const days = daysSince(sale.createdAt);

  return (
    <tr style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--ds-text-primary)' }}>
        {sale.customerName}
      </td>
      <td className="px-4 py-3 text-sm tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>
        {formatAmount(sale.amount, sale.currency)}
      </td>
      <td
        className="px-4 py-3 text-sm tabular-nums"
        style={{ color: days > 14 ? 'var(--ds-danger-text)' : 'var(--ds-text-secondary)' }}
      >
        {days}d
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {style.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums" style={{ color: 'var(--ds-text-secondary)' }}>
        {sale.remindersSent}
      </td>
      <td className="px-4 py-3">
        {sale.status === 'active' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => remind(sale.id)}
              disabled={isReminding}
              className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: 'var(--ds-warning-text)',
                border: '1px solid var(--ds-warning-border)',
                backgroundColor: 'var(--ds-warning-bg)',
              }}
            >
              {isReminding ? 'Sending…' : 'Remind'}
            </button>
            <button
              type="button"
              onClick={() => settle(sale.id)}
              disabled={isSettling}
              className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: 'var(--ds-success-text)',
                border: '1px solid var(--ds-success-border)',
                backgroundColor: 'var(--ds-success-bg)',
              }}
            >
              {isSettling ? 'Marking…' : 'Settled'}
            </button>
            <button
              type="button"
              onClick={() => dispute(sale.id)}
              disabled={isDisputing}
              className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: 'var(--ds-danger-text)',
                border: '1px solid var(--ds-danger-border)',
              }}
            >
              {isDisputing ? '…' : 'Dispute'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

const TABS: { key: string; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'settled', label: 'Settled' },
  { key: 'disputed', label: 'Disputed' },
  { key: 'written_off', label: 'Written off' },
];

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState<string>('active');
  const { data: sales = [], isLoading } = useCreditSales(activeTab);

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          Credit Sales
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ds-text-secondary)' }}>
          Track outstanding credit sales and send payment reminders.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: 'var(--ds-border-base)' }}
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: isActive ? 'var(--ds-brand-text)' : 'var(--ds-text-secondary)',
                borderBottom: isActive ? '2px solid var(--ds-brand-bg)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="flex-1 overflow-auto rounded-xl"
        style={{ border: '1px solid var(--ds-border-base)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div
              className="h-3 w-24 rounded animate-pulse"
              style={{ backgroundColor: 'var(--ds-bg-subtle)' }}
            />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
              No {activeTab} credit sales.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead style={{ backgroundColor: 'var(--ds-bg-elevated)' }}>
              <tr>
                {['Customer', 'Amount', 'Age', 'Status', 'Reminders', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-xs font-semibold"
                    style={{
                      color: 'var(--ds-text-secondary)',
                      borderBottom: '1px solid var(--ds-border-base)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--ds-bg-surface)' }}>
              {sales.map((sale) => (
                <CreditRow key={sale.id} sale={sale} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
