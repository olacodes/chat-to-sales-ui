import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { BASE_URL } from '@/lib/api/config';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoreListItem {
  business_name: string;
  business_category: string;
  store_slug: string;
  item_count: number;
}

interface StoreListResponse {
  items: StoreListItem[];
  total: number;
}

// ─── Category display config ─────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  provisions: { label: 'Provisions', emoji: '\u{1F6D2}' },
  fashion: { label: 'Fashion', emoji: '\u{1F457}' },
  food: { label: 'Food & Drinks', emoji: '\u{1F371}' },
  electronics: { label: 'Electronics', emoji: '\u{1F4F1}' },
  fabrics: { label: 'Fabrics', emoji: '\u{1F9F5}' },
  fabric: { label: 'Fabrics', emoji: '\u{1F9F5}' },
  cosmetics: { label: 'Cosmetics', emoji: '\u{2728}' },
  building: { label: 'Building Materials', emoji: '\u{1F3D7}' },
  other: { label: 'Other', emoji: '\u{1F4E6}' },
};

function getCategoryMeta(category: string) {
  const key = category.toLowerCase();
  return CATEGORY_META[key] ?? { label: category || 'Other', emoji: '\u{1F4E6}' };
}

// ─── Data fetching ───────────────────────────────────────────────────────────

async function getStores(): Promise<StoreListItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/stores`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as StoreListResponse;
    return data.items ?? [];
  } catch {
    return [];
  }
}

function groupByCategory(stores: StoreListItem[]): Map<string, StoreListItem[]> {
  const groups = new Map<string, StoreListItem[]>();
  for (const store of stores) {
    const key = store.business_category.toLowerCase() || 'other';
    const list = groups.get(key) ?? [];
    list.push(store);
    groups.set(key, list);
  }
  return groups;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Stores — ChatToSales',
  description: 'Browse stores on ChatToSales and order directly on WhatsApp.',
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function StoreDirectoryPage() {
  const stores = await getStores();
  const grouped = groupByCategory(stores);

  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-12">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--ds-text-primary)' }}
          >
            Discover stores
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            Browse traders on ChatToSales and order straight from WhatsApp.
          </p>
        </div>

        {/* Empty state */}
        {stores.length === 0 && (
          <div
            className="mx-auto max-w-md rounded-xl px-6 py-14 text-center"
            style={{
              border: '1px solid var(--ds-border-base)',
              backgroundColor: 'var(--ds-bg-surface)',
            }}
          >
            <p className="text-3xl mb-3" aria-hidden="true">{'\u{1F3EA}'}</p>
            <p
              className="text-base font-semibold"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              Stores are on their way
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              Traders are setting up shop. Check back soon or start your own store!
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              Open your store
            </Link>
          </div>
        )}

        {/* Category sections */}
        {Array.from(grouped.entries()).map(([categoryKey, categoryStores]) => {
          const meta = getCategoryMeta(categoryKey);
          return (
            <section key={categoryKey} className="mb-10">
              <h2
                className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                style={{ color: 'var(--ds-text-tertiary)' }}
              >
                <span>{meta.emoji}</span>
                {meta.label}
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: 'var(--ds-bg-active)',
                    color: 'var(--ds-text-tertiary)',
                  }}
                >
                  {categoryStores.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryStores.map((store) => (
                  <Link
                    key={store.store_slug}
                    href={`/stores/${store.store_slug}`}
                    className="group rounded-xl px-5 py-4 transition-all hover:shadow-md active:scale-[0.99]"
                    style={{
                      border: '1px solid var(--ds-border-base)',
                      backgroundColor: 'var(--ds-bg-surface)',
                    }}
                  >
                    <p
                      className="text-sm font-semibold truncate group-hover:underline"
                      style={{ color: 'var(--ds-text-primary)' }}
                    >
                      {store.business_name}
                    </p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: 'var(--ds-text-secondary)' }}
                    >
                      {store.item_count > 0
                        ? `${store.item_count} ${store.item_count === 1 ? 'item' : 'items'} in catalogue`
                        : 'Send a message to order'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA at the bottom */}
        {stores.length > 0 && (
          <div
            className="mt-6 rounded-xl px-6 py-8 text-center"
            style={{
              border: '1px solid var(--ds-border-base)',
              backgroundColor: 'var(--ds-bg-surface)',
            }}
          >
            <p
              className="text-base font-bold"
              style={{ color: 'var(--ds-text-primary)' }}
            >
              Want your store here?
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              Set up in under a minute. Start selling on WhatsApp today.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              Open your store
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
