'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { apiClient, ApiError } from '@/lib/api/client';
import { TENANT_ID } from '@/lib/api/config';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'select' | 'connecting' | 'success';

interface WhatsAppCredentials {
  phone_number_id: string;
  access_token: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Simulates the Meta WhatsApp embedded signup flow.
 * Replace with the real Meta JS SDK call when ready:
 *   window.FB.login(callback, { scope: 'whatsapp_business_management' })
 */
async function runEmbeddedSignup(): Promise<WhatsAppCredentials> {
  await new Promise((r) => setTimeout(r, 1800));
  return { phone_number_id: '123456789', access_token: 'mock_access_token_abc123' };
}

async function bindWhatsAppToTenant(creds: WhatsAppCredentials) {
  return apiClient.post('/api/v1/channels/whatsapp/connect', {
    tenant_id: TENANT_ID,
    phone_number_id: creds.phone_number_id,
    access_token: creds.access_token,
  });
}

// ─── Channel card ─────────────────────────────────────────────────────────────

interface ChannelCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  disabled?: boolean;
  onClick?: () => void;
}

function ChannelCard({
  icon,
  name,
  description,
  disabled = false,
  onClick,
}: Readonly<ChannelCardProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'group flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-sm active:scale-[0.99]',
      ].join(' ')}
      style={
        disabled
          ? {
              borderColor: 'var(--ds-border-subtle)',
              backgroundColor: 'var(--ds-bg-sunken)',
            }
          : {
              borderColor: 'var(--ds-border-base)',
              backgroundColor: 'var(--ds-bg-surface)',
            }
      }
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: disabled ? 'var(--ds-text-disabled)' : 'var(--ds-text-primary)' }}
        >
          {name}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
          {description}
        </p>
      </div>
      {disabled ? (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: 'var(--ds-bg-active)', color: 'var(--ds-text-tertiary)' }}
        >
          Coming soon
        </span>
      ) : (
        <svg
          className="h-4 w-4 shrink-0 transition-colors group-hover:text-[var(--ds-accent-text)]"
          style={{ color: 'var(--ds-text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

// ─── Step icons ───────────────────────────────────────────────────────────────

const WhatsAppIcon = (
  <div
    className="flex h-10 w-10 items-center justify-center rounded-xl"
    style={{ backgroundColor: 'var(--ds-success-bg)' }}
  >
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      style={{ fill: 'var(--ds-success-text)' }}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.868.518 3.614 1.42 5.113L2 22l5.01-1.391A9.946 9.946 0 0 0 12.004 22C17.525 22 22 17.521 22 12.004 22 6.479 17.525 2 12.004 2zm0 18.16a8.12 8.12 0 0 1-4.178-1.15l-.299-.178-3.094.858.874-3.02-.194-.31a8.144 8.144 0 0 1-1.269-4.356c0-4.512 3.672-8.184 8.184-8.184 4.51 0 8.18 3.672 8.18 8.184 0 4.511-3.67 8.157-8.204 8.157z" />
    </svg>
  </div>
);

const InstagramIcon = (
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-pink-400" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState<string | null>(null);

  async function handleWhatsAppConnect() {
    setStep('connecting');
    setError(null);

    try {
      const creds = await runEmbeddedSignup();
      await bindWhatsAppToTenant(creds);
      setStep('success');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.body.message
          : 'Failed to connect WhatsApp. Please try again.';
      setError(message);
      setStep('select');
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        {/* ── Step: select ──────────────────────────────────────────── */}
        {step === 'select' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-6 text-center">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--ds-brand-text)' }}
              >
                Step 1 of 1
              </p>
              <h1
                className="mt-2 text-xl font-semibold"
                style={{ color: 'var(--ds-text-primary)' }}
              >
                Connect your sales channel
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                Choose where your customers will message you.
              </p>
            </div>

            <div className="space-y-3">
              <ChannelCard
                icon={WhatsAppIcon}
                name="WhatsApp Business"
                description="Connect in 30 seconds via Meta"
                onClick={handleWhatsAppConnect}
              />
              <ChannelCard
                icon={InstagramIcon}
                name="Instagram DMs"
                description="Sell directly from Instagram"
                disabled
              />
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <p className="mt-6 text-center text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              More channels coming soon
            </p>
          </div>
        )}

        {/* ── Step: connecting ──────────────────────────────────────── */}
        {step === 'connecting' && (
          <div className="animate-in fade-in duration-200 flex flex-col items-center py-6 text-center">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--ds-success-bg)' }}
            >
              <svg
                className="h-7 w-7 animate-spin"
                style={{ color: 'var(--ds-success-text)' }}
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
              Connecting to WhatsApp…
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
              Completing verification with Meta. This takes a few seconds.
            </p>
          </div>
        )}

        {/* ── Step: success ─────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="animate-in fade-in duration-200 flex flex-col items-center py-4 text-center">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--ds-success-bg)' }}
            >
              <svg
                className="h-7 w-7"
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

            <h2 className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
              WhatsApp connected!
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
              Send a message to your WhatsApp number to test the connection.
            </p>

            <div
              className="mt-6 w-full rounded-xl px-4 py-3 text-left"
              style={{
                border: '1px solid var(--ds-border-subtle)',
                backgroundColor: 'var(--ds-bg-sunken)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--ds-text-secondary)' }}>
                Next step
              </p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--ds-text-primary)' }}>
                Go to your dashboard and start managing conversations.
              </p>
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={() => router.push('/conversations')}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
