import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {/* Logo mark */}
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: 'var(--ds-brand-bg)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path
            d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72A7.97 7.97 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--ds-text-primary)' }}>
        ChatToSales
      </h1>
      <p className="mt-3 text-base" style={{ color: 'var(--ds-text-secondary)' }}>
        Turn WhatsApp conversations into orders and payments — in real time.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Link href="/signup" className="flex-1">
          <Button className="w-full" size="lg">
            Get started free
          </Button>
        </Link>
        <Link href="/login" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            Sign in
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
        No credit card required &nbsp;·&nbsp; Setup in minutes
      </p>
    </div>
  );
}
