'use client';

/**
 * InlineOrderCard — sticky contextual card shown inside ChatWindow when a
 * conversation has a linked order.
 *
 * Displays the full order state progression and reacts to real-time
 * `OrderStateChanged` and `PaymentConfirmed` WebSocket events via the
 * Zustand store (no prop drilling required — caller just passes the Order).
 *
 * State machine: inquiry → pending → confirmed → paid → completed
 *                              ↘ cancelled (terminal failure state)
 */

import type { Order, OrderStatus } from '@/store';

/* ── Order step config ───────────────────────────────────────── */

type Step = { key: OrderStatus; label: string };

const ORDER_STEPS: Step[] = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'paid', label: 'Paid' },
  { key: 'completed', label: 'Done' },
];

function getStepIndex(status: OrderStatus): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

/* ── Status badge tokens ─────────────────────────────────────── */

type StatusStyle = { bg: string; text: string; border: string; dotColor: string };

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  inquiry: {
    bg: 'var(--ds-info-bg)',
    text: 'var(--ds-info-text)',
    border: 'var(--ds-info-border)',
    dotColor: 'var(--ds-info-dot)',
  },
  pending: {
    bg: 'var(--ds-warning-bg)',
    text: 'var(--ds-warning-text)',
    border: 'var(--ds-warning-border)',
    dotColor: 'var(--ds-warning-dot)',
  },
  confirmed: {
    bg: 'var(--ds-brand-bg-soft)',
    text: 'var(--ds-brand-text)',
    border: 'var(--ds-brand-border)',
    dotColor: 'var(--ds-brand-bg)',
  },
  paid: {
    bg: 'var(--ds-success-bg)',
    text: 'var(--ds-success-text)',
    border: 'var(--ds-success-border)',
    dotColor: 'var(--ds-success-dot)',
  },
  completed: {
    bg: 'var(--ds-success-bg)',
    text: 'var(--ds-success-text)',
    border: 'var(--ds-success-border)',
    dotColor: 'var(--ds-success-dot)',
  },
  cancelled: {
    bg: 'var(--ds-danger-bg)',
    text: 'var(--ds-danger-text)',
    border: 'var(--ds-danger-border)',
    dotColor: 'var(--ds-danger-dot)',
  },
};

/* ── Currency formatter ──────────────────────────────────────── */

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return '—';
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

/* ── Step progress bar ───────────────────────────────────────── */

interface StepProgressProps {
  currentStatus: OrderStatus;
}

function StepProgress({ currentStatus }: Readonly<StepProgressProps>) {
  if (currentStatus === 'cancelled') {
    return (
      <p className="text-xs font-medium" style={{ color: 'var(--ds-danger-text)' }}>
        ✕ Order cancelled
      </p>
    );
  }

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="flex items-center gap-0 w-full" aria-label={`Order progress: ${currentStatus}`}>
      {ORDER_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === ORDER_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="h-2 w-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    isDone || isCurrent ? 'var(--ds-brand-bg)' : 'var(--ds-border-strong)',
                  transform: isCurrent ? 'scale(1.4)' : 'scale(1)',
                  boxShadow: isCurrent
                    ? '0 0 0 2px color-mix(in srgb, var(--ds-brand-bg) 25%, transparent)'
                    : 'none',
                }}
                aria-hidden="true"
              />
              <span
                className="mt-1 text-[9px] font-medium leading-none truncate max-w-[42px] text-center"
                style={{
                  color: isDone || isCurrent ? 'var(--ds-brand-text)' : 'var(--ds-text-tertiary)',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className="flex-1 h-px mx-1 mb-[14px] transition-colors duration-300"
                style={{
                  backgroundColor: isDone ? 'var(--ds-brand-bg)' : 'var(--ds-border-base)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Item count label ────────────────────────────────────────── */

function ItemCountLabel({ count }: Readonly<{ count: number }>) {
  if (count === 0) return <>No items yet</>;
  const plural = count === 1 ? 'item' : 'items';
  return (
    <>
      {count} {plural}
    </>
  );
}

/* ── Main component ──────────────────────────────────────────── */

interface InlineOrderCardProps {
  order: Order;
  /** Fires when the user clicks "View details" */
  onViewDetails?: (orderId: string) => void;
  /** Collapse to a minimal one-line strip */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function InlineOrderCard({
  order,
  onViewDetails,
  collapsed = false,
  onToggleCollapse,
}: Readonly<InlineOrderCardProps>) {
  const { id, status, total, currency, items } = order;
  const style = STATUS_STYLES[status];
  const shortId = id.length > 12 ? `…${id.slice(-8)}` : id;

  return (
    <div
      className="mx-4 my-2 rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
        boxShadow: 'var(--ds-shadow-xs)',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--ds-border-subtle)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Order icon */}
          <span className="text-sm shrink-0" aria-hidden="true">
            📦
          </span>

          {/* ID */}
          <span
            className="text-xs font-mono font-semibold truncate"
            style={{ color: 'var(--ds-text-primary)' }}
            title={id}
          >
            {shortId}
          </span>

          {/* Status badge */}
          <span
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: style.dotColor }}
              aria-hidden="true"
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Amount */}
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: 'var(--ds-text-primary)' }}
          >
            {formatAmount(total, currency)}
          </span>

          {/* View details */}
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(id)}
              className="text-[10px] font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--ds-brand-text)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--ds-brand-bg-soft)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              Details →
            </button>
          )}

          {/* Collapse toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand order card' : 'Collapse order card'}
              className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--ds-text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200"
                style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable body */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-4 space-y-3">
          {/* Item count */}
          <p className="text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>
            <ItemCountLabel count={items.length} />
            {items.length > 0 && (
              <span className="ml-2" style={{ color: 'var(--ds-text-tertiary)' }}>
                {items.map((item) => item.name).join(', ')}
              </span>
            )}
          </p>

          {/* Step progress */}
          <StepProgress currentStatus={status} />
        </div>
      )}
    </div>
  );
}
