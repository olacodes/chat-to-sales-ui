import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { BASE_URL } from '@/lib/api/config';
import type { TraderStoreOut } from '@/lib/api/types';
import { StoreCatalogue } from './StoreCatalogue';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getStore(slug: string): Promise<TraderStoreOut | null> {
  const res = await fetch(`${BASE_URL}/api/v1/stores/${encodeURIComponent(slug)}`, {
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

  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient blob — matches marketing pages */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, var(--ds-brand-bg-soft) 0%, transparent 70%)',
        }}
      />

      <Navbar />

      <main className="relative mx-auto max-w-2xl px-4 pt-24 pb-12">

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
        </div>

        {/* ── Catalogue + cart ─────────────────────────────────────────────── */}
        <StoreCatalogue
          catalogue={store.catalogue}
          orderingWhatsappUrl={store.ordering_whatsapp_url}
          storeSlug={store.store_slug}
        />

      </main>
    </div>
  );
}
