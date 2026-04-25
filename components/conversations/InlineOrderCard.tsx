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

/* ── Item list ───────────────────────────────────────────────── */

/* ── Main component ──────────────────────────────────────────── */

interface InlineOrderCardProps {
  order: Order;
  /** Fires when the user clicks "View details" */
  onViewDetails?: (orderId: string) => void;
  /** Collapse to a minimal one-line strip */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Whether a credit sale already exists for this order */
  hasActiveCreditSale?: boolean;
  /** Called when the agent marks this order as a credit sale */
  onMarkAsCredit?: (orderId: string, amount: number) => void;
  /** Called when the agent confirms an inquiry order that already has items */
  onConfirm?: (orderId: string) => void;
  isConfirming?: boolean;
  /** Called when the agent wants to add details to an empty inquiry order */
  onAddDetails?: () => void;
  /** Called when the agent marks a confirmed order as paid */
  onMarkPaid?: (orderId: string) => void;
  isMarkingPaid?: boolean;
  /** Order switcher navigation */
  orderIndex?: number;
  totalOrders?: number;
  onPrevOrder?: () => void;
  onNextOrder?: () => void;
}

export function InlineOrderCard({
  order,
  onViewDetails,
  collapsed = true,
  onToggleCollapse,
  hasActiveCreditSale = false,
  onMarkAsCredit,
  onConfirm,
  isConfirming = false,
  onAddDetails,
  onMarkPaid,
  isMarkingPaid = false,
  orderIndex = 0,
  totalOrders = 1,
  onPrevOrder,
  onNextOrder,
}: Readonly<InlineOrderCardProps>) {
  const { id, status, total, currency, items, itemCount } = order;
  const style = STATUS_STYLES[status];

  // Collapsed summary: up to 2 "Name ×qty" entries, then "+N more"
  const itemSummary = (() => {
    if (items.length > 0) {
      const parts = items.slice(0, 2).map((i) => `${i.name} ×${i.quantity}`);
      const rest = items.length - 2;
      return rest > 0 ? `${parts.join(', ')} +${rest} more` : parts.join(', ');
    }
    if (itemCount > 0) return `${itemCount} item${itemCount === 1 ? '' : 's'}`;
    return 'No items yet';
  })();

  const showPaymentActions =
    status === 'confirmed' && (onMarkPaid || (onMarkAsCredit && !hasActiveCreditSale));

  return (
    <div
      className="mx-4 my-2 rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
        boxShadow: 'var(--ds-shadow-xs)',
      }}
    >
      {/* Order switcher nav */}
      {totalOrders > 1 && (
        <div
          className="flex items-center justify-between px-4 py-1"
          style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
        >
          <button
            type="button"
            onClick={onPrevOrder}
            disabled={orderIndex === 0}
            className="flex items-center justify-center h-5 w-5 rounded disabled:opacity-30"
            style={{ color: 'var(--ds-text-secondary)' }}
            aria-label="Previous order"
          >
            ←
          </button>
          <span className="text-[10px] font-medium" style={{ color: 'var(--ds-text-tertiary)' }}>
            Order {orderIndex + 1} of {totalOrders}
          </span>
          <button
            type="button"
            onClick={onNextOrder}
            disabled={orderIndex === totalOrders - 1}
            className="flex items-center justify-center h-5 w-5 rounded disabled:opacity-30"
            style={{ color: 'var(--ds-text-secondary)' }}
            aria-label="Next order"
          >
            →
          </button>
        </div>
      )}

      {/* ── Tap-to-expand header ── */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--ds-border-subtle)' }}
      >
        {/* Status badge */}
        <span
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
          style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dotColor }} aria-hidden="true" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>

        {/* Item summary — grows to fill space */}
        <span className="flex-1 min-w-0 truncate text-[11px] font-medium" style={{ color: 'var(--ds-text-primary)' }}>
          {itemSummary}
        </span>

        {/* Total */}
        <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: 'var(--ds-text-primary)' }}>
          {formatAmount(total, currency)}
        </span>

        {/* Chevron */}
        <svg
          className="shrink-0 h-3.5 w-3.5 transition-transform duration-200"
          style={{ color: 'var(--ds-text-tertiary)', transform: collapsed ? 'none' : 'rotate(180deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expanded body ── */}
      {!collapsed && (
        <div className="pb-3 space-y-2.5">
          {/* Item table */}
          {items.length > 0 ? (
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}>
                  {['Item', 'Qty', 'Price', 'Subtotal'].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-1 font-semibold ${h === 'Item' ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--ds-text-tertiary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--ds-border-subtle)' : 'none' }}>
                    <td className="px-4 py-1.5 text-left" style={{ color: 'var(--ds-text-primary)' }}>{item.name}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums" style={{ color: 'var(--ds-text-secondary)' }}>{item.quantity}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums" style={{ color: 'var(--ds-text-secondary)' }}>{formatAmount(item.unitPrice, currency)}</td>
                    <td className="px-4 py-1.5 text-right tabular-nums font-medium" style={{ color: 'var(--ds-text-primary)' }}>{formatAmount(item.unitPrice * item.quantity, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 pt-1 text-[11px]" style={{ color: 'var(--ds-text-tertiary)' }}>No items yet</p>
          )}

          {/* Step progress */}
          <div className="px-4">
            <StepProgress currentStatus={status} />
          </div>

          {/* Inquiry actions */}
          {status === 'inquiry' && (
            <div className="px-4 flex gap-2">
              {itemCount > 0 && onConfirm && (
                <button
                  type="button"
                  onClick={() => onConfirm(id)}
                  disabled={isConfirming}
                  className="flex-1 text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{ color: 'var(--ds-brand-text)', border: '1px solid var(--ds-brand-border)', backgroundColor: 'var(--ds-brand-bg-soft)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
                >
                  {isConfirming ? 'Confirming…' : 'Confirm Order'}
                </button>
              )}
              {itemCount === 0 && onAddDetails && (
                <button
                  type="button"
                  onClick={onAddDetails}
                  className="flex-1 text-xs font-medium py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--ds-warning-text)', border: '1px solid var(--ds-warning-border)', backgroundColor: 'var(--ds-warning-bg)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
                >
                  Add Details
                </button>
              )}
            </div>
          )}

          {/* Payment actions — confirmed orders */}
          {showPaymentActions && (
            <div
              className="mx-4 flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--ds-border-base)' }}
            >
              {onMarkPaid && (
                <button
                  type="button"
                  onClick={() => onMarkPaid(id)}
                  disabled={isMarkingPaid}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    color: 'var(--ds-success-text)',
                    backgroundColor: 'var(--ds-success-bg)',
                    borderRight: onMarkAsCredit && !hasActiveCreditSale ? '1px solid var(--ds-border-base)' : 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
                >
                  <span aria-hidden="true">✓</span>
                  <span>{isMarkingPaid ? 'Marking…' : 'Mark Paid'}</span>
                </button>
              )}
              {onMarkAsCredit && !hasActiveCreditSale && (
                <button
                  type="button"
                  onClick={() => onMarkAsCredit(id, total)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
                  style={{ color: 'var(--ds-warning-text)', backgroundColor: 'var(--ds-warning-bg)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
                >
                  <span aria-hidden="true">⏱</span>
                  <span>Mark Credit</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
