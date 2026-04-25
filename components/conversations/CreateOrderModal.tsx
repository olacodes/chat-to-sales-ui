'use client';

import { useEffect, useState } from 'react';
import type { CreateOrderPayload } from '@/lib/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  /** Stable React key — not sent to backend */
  _key: string;
  name: string;
  quantity: string;
  unitPrice: string;
}

function blankItem(): LineItem {
  return {
    _key: Math.random().toString(36).slice(2),
    name: '',
    quantity: '1',
    unitPrice: '',
  };
}

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseNumber(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOrderPayload) => void;
  isSubmitting?: boolean;
  customerName: string;
  customerIdentifier: string;
  conversationId: string;
  /** Message content shown as context when opened via "Create Order from message" */
  sourceMessage?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateOrderModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  customerName,
  customerIdentifier,
  conversationId,
  sourceMessage,
}: Readonly<CreateOrderModalProps>) {
  const [items, setItems] = useState<LineItem[]>([blankItem()]);
  const [currency, setCurrency] = useState('NGN');
  const [error, setError] = useState<string | null>(null);

  // Reset form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setItems([blankItem()]);
      setCurrency('NGN');
      setError(null);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Derived ──────────────────────────────────────────────────────────────

  const total = items.reduce((sum, item) => {
    return sum + parseNumber(item.quantity) * parseNumber(item.unitPrice);
  }, 0);

  // ── Item row helpers ──────────────────────────────────────────────────────

  function updateItem(key: string, field: keyof Omit<LineItem, '_key'>, value: string) {
    setItems((prev) =>
      prev.map((it) => (it._key === key ? { ...it, [field]: value } : it)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it._key !== key));
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((it) => it.name.trim() !== '');
    if (validItems.length === 0) {
      setError('Add at least one item with a name.');
      return;
    }

    const invalidPrice = validItems.find((it) => parseNumber(it.unitPrice) <= 0);
    if (invalidPrice) {
      setError(`"${invalidPrice.name}" needs a unit price greater than 0.`);
      return;
    }

    const payload: CreateOrderPayload = {
      customer_id: customerIdentifier,
      customer_name: customerName,
      conversation_id: conversationId,
      currency,
      items: validItems.map((it) => ({
        product_id: it._key,
        name: it.name.trim(),
        quantity: Math.max(1, Math.round(parseNumber(it.quantity))),
        unit_price: parseNumber(it.unitPrice),
      })),
    };

    onSubmit(payload);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create order"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-lg rounded-2xl flex flex-col max-h-[90vh]"
          style={{
            backgroundColor: 'var(--ds-bg-surface)',
            border: '1px solid var(--ds-border-base)',
            boxShadow: 'var(--ds-shadow-lg)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}
          >
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
                Create Order
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ds-text-secondary)' }}>
                {customerName || customerIdentifier}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--ds-text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Source message context — Idea 3 */}
              {sourceMessage && (
                <div
                  className="rounded-xl px-3.5 py-3 text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--ds-warning-bg)',
                    border: '1px solid var(--ds-warning-border)',
                    color: 'var(--ds-warning-text)',
                  }}
                >
                  <p className="font-semibold mb-1">From message</p>
                  <p className="line-clamp-4" style={{ color: 'var(--ds-text-secondary)' }}>
                    {sourceMessage}
                  </p>
                </div>
              )}

              {/* Currency */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium shrink-0" style={{ color: 'var(--ds-text-secondary)' }}>
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                  style={{
                    border: '1px solid var(--ds-border-base)',
                    backgroundColor: 'var(--ds-bg-sunken)',
                    color: 'var(--ds-text-primary)',
                  }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Items table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--ds-text-secondary)' }}>
                    ITEMS
                  </p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--ds-brand-text)' }}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add item
                  </button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_60px_90px_28px] gap-1.5 mb-1.5 px-0.5">
                  {['Item name', 'Qty', 'Unit price', ''].map((h) => (
                    <span
                      key={h}
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--ds-text-tertiary)' }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item._key} className="grid grid-cols-[1fr_60px_90px_28px] gap-1.5 items-center">
                      {/* Name */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item._key, 'name', e.target.value)}
                        placeholder="e.g. Ankara fabric"
                        className="rounded-lg px-2.5 py-1.5 text-xs focus:outline-none w-full"
                        style={{
                          border: '1px solid var(--ds-border-base)',
                          backgroundColor: 'var(--ds-bg-sunken)',
                          color: 'var(--ds-text-primary)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-focus)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-base)')}
                      />
                      {/* Qty */}
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item._key, 'quantity', e.target.value)}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-center focus:outline-none w-full"
                        style={{
                          border: '1px solid var(--ds-border-base)',
                          backgroundColor: 'var(--ds-bg-sunken)',
                          color: 'var(--ds-text-primary)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-focus)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-base)')}
                      />
                      {/* Unit price */}
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item._key, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="rounded-lg px-2.5 py-1.5 text-xs text-right focus:outline-none w-full"
                        style={{
                          border: '1px solid var(--ds-border-base)',
                          backgroundColor: 'var(--ds-bg-sunken)',
                          color: 'var(--ds-text-primary)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-focus)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ds-border-base)')}
                      />
                      {/* Remove */}
                      {items.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeItem(item._key)}
                          aria-label="Remove item"
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                          style={{ color: 'var(--ds-text-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--ds-danger-bg)';
                            e.currentTarget.style.color = 'var(--ds-danger-text)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = 'var(--ds-text-tertiary)';
                          }}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer — total + submit */}
            <div
              className="shrink-0 px-5 py-4 flex items-center justify-between gap-4"
              style={{ borderTop: '1px solid var(--ds-border-subtle)' }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ds-text-tertiary)' }}>
                  Total
                </p>
                <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color: 'var(--ds-text-primary)' }}>
                  {formatCurrency(total, currency)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    color: 'var(--ds-text-secondary)',
                    border: '1px solid var(--ds-border-base)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || total === 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--ds-brand-bg)',
                    color: 'var(--ds-text-inverse)',
                  }}
                  onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {isSubmitting ? 'Creating…' : 'Create & Confirm Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
