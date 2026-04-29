import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { BASE_URL } from '@/lib/api/config';
import type { TraderStoreOut } from '@/lib/api/types';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getStore(slug: string): Promise<TraderStoreOut | null> {
  const res = await fetch(`${BASE_URL}/api/v1/store/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load store');
  return res.json() as Promise<TraderStoreOut>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: 'Store not found' };
  return {
    title: `${store.business_name} — ChatToSales`,
    description: `Browse and order from ${store.business_name} on WhatsApp`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  const whatsappUrl = `https://wa.me/${store.phone_number}`;

  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-12">

        {/* ── Store header ─────────────────────────────────────────────────── */}
        <div
          className="rounded-xl px-6 py-8 mb-8 text-center"
          style={{
            background:
              'linear-gradient(135deg, var(--ds-brand-bg-soft) 0%, var(--ds-bg-surface) 65%)',
            border: '1px solid var(--ds-border-base)',
            boxShadow: 'var(--ds-shadow-xs)',
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: 'var(--ds-brand-bg-soft)' }}
            aria-hidden="true"
          >
            🛍️
          </div>

          <h1 className="text-2xl font-bold" style={{ color: 'var(--ds-text-primary)' }}>
            {store.business_name}
          </h1>

          <p
            className="mt-1 text-sm capitalize"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {store.business_category}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.853L0 24l6.335-1.498A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.36-.214-3.733.882.936-3.619-.234-.372A9.806 9.806 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
            </svg>
            Order on WhatsApp
          </a>
        </div>

        {/* ── Catalogue ────────────────────────────────────────────────────── */}
        {store.catalogue.length > 0 ? (
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
              {store.catalogue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    backgroundColor: 'var(--ds-bg-surface)',
                    borderBottom:
                      index < store.catalogue.length - 1
                        ? '1px solid var(--ds-border-base)'
                        : 'none',
                  }}
                >
                  <span className="text-sm" style={{ color: 'var(--ds-text-primary)' }}>
                    {item.name}
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: 'var(--ds-text-primary)' }}
                  >
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    }).format(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
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
              Message us on WhatsApp to ask about prices and availability.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
