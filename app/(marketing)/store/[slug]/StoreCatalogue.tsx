'use client';

import { useState, useMemo } from 'react';
import type { CatalogueItemOut } from '@/lib/api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ngn = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

function extractWaNumber(url: string): string {
  const match = url.match(/wa\.me\/(\d+)/);
  return match?.[1] ?? '';
}

function buildOrderUrl(waNumber: string, storeSlug: string, items: Array<{ name: string; quantity: number }>): string {
  const lines = items.map((item) => `${item.name} x${item.quantity}`).join('\n');
  const text = `ORDER:${storeSlug}\n${lines}`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

// ─── WhatsApp icon ────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.853L0 24l6.335-1.498A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.36-.214-3.733.882.936-3.619-.234-.372A9.806 9.806 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  catalogue: CatalogueItemOut[];
  orderingWhatsappUrl: string;
  storeSlug: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StoreCatalogue({ catalogue, orderingWhatsappUrl, storeSlug }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  function increment(name: string) {
    setQuantities((q) => ({ ...q, [name]: (q[name] ?? 0) + 1 }));
  }

  function decrement(name: string) {
    setQuantities((q) => {
      const next = (q[name] ?? 0) - 1;
      if (next <= 0) {
        const { [name]: _removed, ...rest } = q;
        return rest;
      }
      return { ...q, [name]: next };
    });
  }

  const selectedItems = useMemo(
    () =>
      catalogue
        .filter((item) => (quantities[item.name] ?? 0) > 0)
        .map((item) => ({ name: item.name, price: item.price, quantity: quantities[item.name] })),
    [catalogue, quantities],
  );

  const total = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const orderUrl = useMemo(() => {
    if (selectedItems.length === 0) return orderingWhatsappUrl;
    const waNumber = extractWaNumber(orderingWhatsappUrl);
    if (!waNumber) return orderingWhatsappUrl;
    return buildOrderUrl(waNumber, storeSlug, selectedItems);
  }, [selectedItems, orderingWhatsappUrl, storeSlug]);

  // ── Empty catalogue ──────────────────────────────────────────────────────────

  if (catalogue.length === 0) {
    return (
      <div
        className="rounded-xl px-6 py-10 text-center"
        style={{
          border: '1px solid var(--ds-border-base)',
          backgroundColor: 'var(--ds-bg-surface)',
        }}
      >
        <p className="text-2xl mb-2" aria-hidden="true">📋</p>
        <p className="text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>
          Price list coming soon
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
          Tap below to ask about prices and availability.
        </p>
        <a
          href={orderingWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#25D366' }}
        >
          <WhatsAppIcon />
          Order on WhatsApp
        </a>
      </div>
    );
  }

  // ── Interactive catalogue ────────────────────────────────────────────────────

  return (
    <>
      <section aria-label="Price list">
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--ds-text-tertiary)' }}
        >
          Price List
        </h2>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--ds-border-base)',
            boxShadow: 'var(--ds-shadow-xs)',
          }}
        >
          {catalogue.map((item, index) => {
            const qty = quantities[item.name] ?? 0;
            const isSelected = qty > 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between px-5 py-3.5 gap-4"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--ds-brand-bg-soft)'
                    : 'var(--ds-bg-surface)',
                  borderBottom:
                    index < catalogue.length - 1
                      ? '1px solid var(--ds-border-base)'
                      : 'none',
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Name + price */}
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--ds-text-primary)' }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs tabular-nums mt-0.5"
                    style={{ color: 'var(--ds-text-secondary)' }}
                  >
                    {ngn.format(item.price)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSelected && (
                    <>
                      <button
                        onClick={() => decrement(item.name)}
                        aria-label={`Remove one ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition-opacity hover:opacity-70"
                        style={{
                          backgroundColor: 'var(--ds-border-base)',
                          color: 'var(--ds-text-primary)',
                        }}
                      >
                        −
                      </button>
                      <span
                        className="w-5 text-center text-sm font-semibold tabular-nums"
                        style={{ color: 'var(--ds-text-primary)' }}
                      >
                        {qty}
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => increment(item.name)}
                    aria-label={`Add ${item.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedItems.length === 0 && (
          <p
            className="mt-3 text-center text-xs"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            Tap + to add items to your order
          </p>
        )}
      </section>

      {/* ── Sticky order bar ─────────────────────────────────────────────────── */}
      {selectedItems.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3"
          style={{ backgroundColor: 'var(--ds-bg-base)' }}
        >
          <div className="mx-auto max-w-2xl">
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              style={{
                backgroundColor: 'var(--ds-bg-surface)',
                border: '1px solid var(--ds-border-base)',
                boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.08)',
              }}
            >
              <div>
                <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                  {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                </p>
                <p
                  className="text-base font-bold tabular-nums"
                  style={{ color: 'var(--ds-text-primary)' }}
                >
                  {ngn.format(total)}
                </p>
              </div>

              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon />
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so sticky bar does not cover last catalogue item */}
      {selectedItems.length > 0 && <div className="h-24" aria-hidden="true" />}
    </>
  );
}
