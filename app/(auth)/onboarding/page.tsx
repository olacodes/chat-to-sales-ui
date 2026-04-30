'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoreSlug(): string | null {
  try {
    return sessionStorage.getItem('cts-store-slug');
  } catch {
    return null;
  }
}

function buildStoreUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/stores/${slug}`;
  }
  return `/stores/${slug}`;
}

function buildWhatsAppShareUrl(storeUrl: string, businessName: string): string {
  const text = `Check out my store and place your order here: ${storeUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStoreSlug(getStoreSlug());
  }, []);

  const storeUrl = storeSlug ? buildStoreUrl(storeSlug) : null;
  const shareUrl = storeUrl ? buildWhatsAppShareUrl(storeUrl, '') : null;

  async function handleCopy() {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — select text
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">

          {/* Celebration icon */}
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--ds-success-bg)' }}
          >
            <svg
              className="h-8 w-8"
              style={{ color: 'var(--ds-success-text)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--ds-text-primary)' }}
          >
            Your store is live!
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            Customers can now browse your store and order from you on WhatsApp.
          </p>

          {/* Store URL display */}
          {storeUrl && (
            <div className="mt-6 w-full">
              <button
                type="button"
                onClick={handleCopy}
                className="group flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left transition-all hover:shadow-sm"
                style={{
                  border: '1px solid var(--ds-border-base)',
                  backgroundColor: 'var(--ds-bg-sunken)',
                }}
              >
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium"
                  style={{ color: 'var(--ds-text-primary)' }}
                >
                  {storeUrl}
                </span>
                <span
                  className="shrink-0 text-xs font-medium transition-colors"
                  style={{ color: copied ? 'var(--ds-success-text)' : 'var(--ds-text-tertiary)' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          )}

          {/* Share on WhatsApp — primary CTA */}
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.868.518 3.614 1.42 5.113L2 22l5.01-1.391A9.946 9.946 0 0 0 12.004 22C17.525 22 22 17.521 22 12.004 22 6.479 17.525 2 12.004 2zm0 18.16a8.12 8.12 0 0 1-4.178-1.15l-.299-.178-3.094.858.874-3.02-.194-.31a8.144 8.144 0 0 1-1.269-4.356c0-4.512 3.672-8.184 8.184-8.184 4.51 0 8.18 3.672 8.18 8.184 0 4.511-3.67 8.157-8.204 8.157z" />
              </svg>
              Share on WhatsApp
            </a>
          )}

          {/* Fallback when no slug available */}
          {!storeUrl && (
            <p
              className="mt-6 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--ds-bg-sunken)',
                border: '1px solid var(--ds-border-base)',
                color: 'var(--ds-text-secondary)',
              }}
            >
              Head to your dashboard to find your store link and start sharing it with customers.
            </p>
          )}

          {/* Dashboard CTA */}
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>

          <p
            className="mt-6 text-xs"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            Customers order via the shared ChatToSales number for now.
            You can connect your own WhatsApp number anytime from Settings.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
