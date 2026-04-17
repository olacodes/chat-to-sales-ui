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
import { loginWithEmail, loginWithGoogle } from '@/lib/auth/service';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 404) return 'Invalid email or password.';
    return error.body.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Could not sign in. Please try again.';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const submittingRef = useRef(false);

  /** Destination after successful login — defaults to dashboard */
  function getNextUrl() {
    const next = searchParams.get('next');
    // Only allow relative paths to prevent open redirect attacks
    if (next && next.startsWith('/') && !next.startsWith('//')) return next;
    return '/dashboard';
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const isBusy = isSubmitting || isGoogleLoading;

  const onSubmit = handleSubmit(async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitError(null);
    setIsSuccess(false);

    try {
      await loginWithEmail(values.email, values.password);
      setIsSuccess(true);
      setTimeout(() => router.push(getNextUrl()), 700);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      submittingRef.current = false;
    }
  });

  async function handleGoogleLogin() {
    if (isBusy) return;
    setSubmitError(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle('mock_google_token');
      setIsSuccess(true);
      setTimeout(() => router.push(getNextUrl()), 700);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
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
            Sign in to your ChatToSales account
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Input
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={isBusy}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            disabled={isBusy}
            error={errors.password?.message}
            {...register('password')}
          />

          {submitError && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
            >
              {submitError}
            </p>
          )}

          {isSuccess && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}
            >
              Signed in. Redirecting to dashboard\u2026
            </p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isBusy}>
            Sign in
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
            loading={isGoogleLoading}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium" style={{ color: 'var(--ds-accent-text)' }}>
            Get started free
          </Link>
        </p>
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
