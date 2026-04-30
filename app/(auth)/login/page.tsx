'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/lib/api/client';
import { loginWithEmail, loginWithGoogle, requestOtp, verifyOtp } from '@/lib/auth/service';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const phoneSchema = z.object({
  phone_number: z
    .string()
    .min(7, 'Enter a valid phone number')
    .transform((v) => v.replace(/\D/g, '')),
});

const otpSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code').regex(/^\d+$/, 'Digits only'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// ─── Error helper ─────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 404) return fallback;
    if (error.status === 429) return 'Too many attempts. Please wait 10 minutes.';
    return error.body?.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Could not sign in. Please try again.';
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 'email' | 'phone' | 'otp'
  const [mode, setMode] = useState<'email' | 'phone' | 'otp'>('email');
  const [pendingPhone, setPendingPhone] = useState('');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const submittingRef = useRef(false);

  function getNextUrl() {
    const next = searchParams.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) return next;
    return '/dashboard';
  }

  function onLoginSuccess() {
    setIsSuccess(true);
    setTimeout(() => router.push(getNextUrl()), 700);
  }

  // ── Email form ──────────────────────────────────────────────────────────────

  const emailForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const isEmailBusy = emailForm.formState.isSubmitting || isGoogleLoading;

  const onEmailSubmit = emailForm.handleSubmit(async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError(null);

    try {
      await loginWithEmail(values.email, values.password);
      onLoginSuccess();
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Invalid email or password.'));
    } finally {
      submittingRef.current = false;
    }
  });

  async function handleGoogleLogin() {
    if (isEmailBusy) return;
    setSubmitError(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle('mock_google_token');
      onLoginSuccess();
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not sign in with Google.'));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // ── Phone form ──────────────────────────────────────────────────────────────

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone_number: '' },
  });

  const onPhoneSubmit = phoneForm.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await requestOtp(values.phone_number);
      setPendingPhone(values.phone_number);
      setMode('otp');
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not send code. Check the number and try again.'));
    }
  });

  // ── OTP form ────────────────────────────────────────────────────────────────

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await verifyOtp(pendingPhone, values.code);
      onLoginSuccess();
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Invalid or expired code.'));
    }
  });

  async function handleResend() {
    setSubmitError(null);
    otpForm.reset();

    try {
      await requestOtp(pendingPhone);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not resend code.'));
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: 'var(--ds-brand-bg)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72A7.97 7.97 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            {mode === 'otp'
              ? `Enter the code sent to +${pendingPhone}`
              : 'Sign in to your ChatToSales account'}
          </p>
        </div>

        {/* Email/password mode */}
        {mode === 'email' && (
          <>
            <form className="space-y-4" onSubmit={onEmailSubmit} noValidate>
              <Input
                type="email"
                label="Email"
                placeholder="you@company.com"
                autoComplete="email"
                disabled={isEmailBusy}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />
              <Input
                type="password"
                label="Password"
                placeholder="Your password"
                autoComplete="current-password"
                disabled={isEmailBusy}
                error={emailForm.formState.errors.password?.message}
                {...emailForm.register('password')}
              />

              {submitError && (
                <p className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}>
                  {submitError}
                </p>
              )}
              {isSuccess && (
                <p className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}>
                  Signed in. Redirecting to dashboard&hellip;
                </p>
              )}

              <Button type="submit" className="w-full" loading={emailForm.formState.isSubmitting} disabled={isEmailBusy}>
                Sign in
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={isEmailBusy} loading={isGoogleLoading} onClick={handleGoogleLogin}>
                Continue with Google
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--ds-border-base)' }} />
              <span className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>or</span>
              <div className="h-px flex-1" style={{ backgroundColor: 'var(--ds-border-base)' }} />
            </div>

            <button
              type="button"
              onClick={() => { setSubmitError(null); setMode('phone'); }}
              className="mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--ds-border-base)', color: 'var(--ds-text-primary)' }}
            >
              Sign in with WhatsApp number
            </button>
          </>
        )}

        {/* Phone number mode */}
        {mode === 'phone' && (
          <form className="space-y-4" onSubmit={onPhoneSubmit} noValidate>
            <Input
              type="tel"
              label="WhatsApp phone number"
              placeholder="2348012345678"
              autoComplete="tel"
              error={phoneForm.formState.errors.phone_number?.message}
              {...phoneForm.register('phone_number')}
            />
            <p className="text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
              Enter the number you used to register on WhatsApp. Include your country code.
            </p>

            {submitError && (
              <p className="rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}>
                {submitError}
              </p>
            )}

            <Button type="submit" className="w-full" loading={phoneForm.formState.isSubmitting}>
              Send code
            </Button>
            <button
              type="button"
              onClick={() => { setSubmitError(null); setMode('email'); }}
              className="w-full text-center text-sm"
              style={{ color: 'var(--ds-text-secondary)' }}
            >
              Back to email login
            </button>
          </form>
        )}

        {/* OTP verification mode */}
        {mode === 'otp' && (
          <form className="space-y-4" onSubmit={onOtpSubmit} noValidate>
            <Input
              type="text"
              inputMode="numeric"
              label="6-digit code"
              placeholder="123456"
              autoComplete="one-time-code"
              maxLength={6}
              error={otpForm.formState.errors.code?.message}
              {...otpForm.register('code')}
            />

            {submitError && (
              <p className="rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}>
                {submitError}
              </p>
            )}
            {isSuccess && (
              <p className="rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}>
                Signed in. Redirecting to dashboard&hellip;
              </p>
            )}

            <Button type="submit" className="w-full" loading={otpForm.formState.isSubmitting}>
              Verify code
            </Button>
            <div className="flex justify-between text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
              <button type="button" onClick={handleResend} className="hover:underline">
                Send again
              </button>
              <button type="button" onClick={() => { setSubmitError(null); setMode('phone'); }} className="hover:underline">
                Change number
              </button>
            </div>
          </form>
        )}

        {mode !== 'otp' && (
          <p className="mt-5 text-center text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium" style={{ color: 'var(--ds-accent-text)' }}>
              Get started free
            </Link>
          </p>
        )}

      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
