'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { signupWithPhone, verifyOtp } from '@/lib/auth/service';

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'provisions', label: 'Provisions', emoji: '\u{1F6D2}' },
  { value: 'fashion', label: 'Fashion', emoji: '\u{1F457}' },
  { value: 'food', label: 'Food & Drinks', emoji: '\u{1F371}' },
  { value: 'electronics', label: 'Electronics', emoji: '\u{1F4F1}' },
  { value: 'fabrics', label: 'Fabrics', emoji: '\u{1F9F5}' },
  { value: 'other', label: 'Other', emoji: '\u{1F4E6}' },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'A store with this number already exists. Try logging in.';
    if (error.status === 400) return error.body?.message || 'Invalid details. Please check your input.';
    return error.body?.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const submittingRef = useRef(false);

  // Step control
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // OTP fields
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cleanPhone = phone.replace(/\D/g, '');

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate() {
    const errors: Record<string, string> = {};
    if (!businessName.trim()) errors.businessName = 'Enter your business name.';
    else if (businessName.trim().length < 2) errors.businessName = 'At least 2 characters.';
    if (!category) errors.category = 'Pick a category.';
    if (!cleanPhone || cleanPhone.length < 10) errors.phone = 'Enter a valid WhatsApp number with country code.';
    return errors;
  }

  // ── Form submit ─────────────────────────────────────────────────────────────

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setFormError(null);
    setIsFormLoading(true);
    try {
      await signupWithPhone({
        phone_number: cleanPhone,
        business_name: businessName.trim(),
        business_category: category,
      });
      setStep('otp');
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsFormLoading(false);
    }
  }

  // ── OTP submit ──────────────────────────────────────────────────────────────

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    if (otp.replace(/\D/g, '').length !== 6) {
      setOtpError('Enter the 6-digit code.');
      return;
    }
    submittingRef.current = true;
    setOtpError(null);
    setIsOtpLoading(true);
    try {
      await verifyOtp(cleanPhone, otp.replace(/\D/g, ''));
      setIsSuccess(true);
      setTimeout(() => router.push('/onboarding'), 700);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setIsOtpLoading(false);
      submittingRef.current = false;
    }
  }

  async function handleResend() {
    setOtpError(null);
    setOtp('');
    try {
      await signupWithPhone({
        phone_number: cleanPhone,
        business_name: businessName.trim(),
        business_category: category,
      });
    } catch (err) {
      setOtpError(getErrorMessage(err));
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">

        {/* ── Step 1: Business info ──────────────────────────────────── */}
        {step === 'form' && (
          <>
            <div className="mb-6 text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.868.518 3.614 1.42 5.113L2 22l5.01-1.391A9.946 9.946 0 0 0 12.004 22C17.525 22 22 17.521 22 12.004 22 6.479 17.525 2 12.004 2zm0 18.16a8.12 8.12 0 0 1-4.178-1.15l-.299-.178-3.094.858.874-3.02-.194-.31a8.144 8.144 0 0 1-1.269-4.356c0-4.512 3.672-8.184 8.184-8.184 4.51 0 8.18 3.672 8.18 8.184 0 4.511-3.67 8.157-8.204 8.157z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
                Start selling on WhatsApp
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                Set up your store in under a minute
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleFormSubmit} noValidate>
              <Input
                label="Business name"
                placeholder="e.g. Mama Caro Provisions"
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                error={fieldErrors.businessName}
                disabled={isFormLoading}
              />

              {/* Category grid */}
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--ds-text-primary)' }}
                >
                  What do you sell?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { setCategory(cat.value); setFieldErrors((p) => ({ ...p, category: '' })); }}
                        disabled={isFormLoading}
                        className={[
                          'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          selected ? 'ring-1' : 'hover:shadow-sm',
                        ].join(' ')}
                        style={{
                          borderColor: selected ? '#25D366' : 'var(--ds-border-base)',
                          backgroundColor: selected ? 'rgba(37, 211, 102, 0.08)' : 'var(--ds-bg-surface)',
                          ...(selected && { ringColor: '#25D366' }),
                        }}
                      >
                        <span className="text-xl leading-none">{cat.emoji}</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: selected ? '#25D366' : 'var(--ds-text-secondary)' }}
                        >
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.category && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--ds-danger-text)' }}>
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="tel"
                  label="WhatsApp number"
                  placeholder="2348012345678"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={fieldErrors.phone}
                  disabled={isFormLoading}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
                  Include country code. We'll send a one-time code to confirm.
                </p>
              </div>

              {formError && (
                <p
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
                >
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full" loading={isFormLoading} disabled={isFormLoading}>
                Create my store
              </Button>
            </form>

            <p className="mt-5 text-center text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-medium" style={{ color: 'var(--ds-accent-text)' }}>
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2: OTP verification ──────────────────────────────── */}
        {step === 'otp' && (
          <>
            <div className="mb-6 text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--ds-accent-bg-soft)', color: 'var(--ds-accent-text)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.3 48.3 0 0 0 5.862-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
                Confirm your number
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                Enter the 6-digit code sent to{' '}
                <span className="font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                  +{cleanPhone}
                </span>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleOtpSubmit} noValidate>
              <Input
                type="text"
                inputMode="numeric"
                label="Verification code"
                placeholder="123456"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isOtpLoading}
              />

              {otpError && (
                <p
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
                >
                  {otpError}
                </p>
              )}

              {isSuccess && (
                <p
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}
                >
                  Store created! Taking you there now...
                </p>
              )}

              <Button type="submit" className="w-full" loading={isOtpLoading} disabled={isOtpLoading || isSuccess}>
                Verify & create store
              </Button>

              <div className="flex justify-between text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                <button type="button" onClick={handleResend} className="hover:underline">
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtpError(null); setOtp(''); }}
                  className="hover:underline"
                >
                  Change details
                </button>
              </div>
            </form>
          </>
        )}

      </CardBody>
    </Card>
  );
}
