import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';

export default function StoreNotFound() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-20 text-center">

        {/* Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: 'var(--ds-bg-sunken)' }}
        >
          <span className="text-4xl" aria-hidden="true">{'\u{1F50D}'}</span>
        </div>

        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--ds-text-primary)' }}
        >
          Store not found
        </h1>

        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)' }}
        >
          This store doesn't exist yet — but yours could.
          <br />
          Set up a store on ChatToSales and start taking orders on WhatsApp in under a minute.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.12 1.52 5.853L0 24l6.335-1.498A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.36-.214-3.733.882.936-3.619-.234-.372A9.806 9.806 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
            </svg>
            Open your own store
          </Link>

          <Link
            href="/stores"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--ds-accent-text)' }}
          >
            Browse other stores
          </Link>
        </div>

        {/* Social proof nudge */}
        <div
          className="mt-12 rounded-xl px-5 py-4"
          style={{
            border: '1px solid var(--ds-border-base)',
            backgroundColor: 'var(--ds-bg-surface)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            How it works
          </p>
          <div className="mt-3 flex items-start gap-3 text-left">
            <span className="shrink-0 text-lg" aria-hidden="true">{'\u{1F4DD}'}</span>
            <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              Fill in your business name, category, and WhatsApp number
            </p>
          </div>
          <div className="mt-2 flex items-start gap-3 text-left">
            <span className="shrink-0 text-lg" aria-hidden="true">{'\u{1F6D2}'}</span>
            <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              Your store goes live — share the link with customers
            </p>
          </div>
          <div className="mt-2 flex items-start gap-3 text-left">
            <span className="shrink-0 text-lg" aria-hidden="true">{'\u{1F4AC}'}</span>
            <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              Orders come in on WhatsApp — confirm, track, and get paid
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
