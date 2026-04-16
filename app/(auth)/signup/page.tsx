'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { apiClient, ApiError } from '@/lib/api/client';

const signupSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

async function signupWithEmail(payload: SignupFormValues) {
  return apiClient.post('/api/v1/auth/signup', payload);
}

export default function SignupPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSuccess(false);

    try {
      await signupWithEmail(values);
      setIsSuccess(true);
      setTimeout(() => router.push('/onboarding'), 700);
    } catch (error) {
      let message = 'Could not create your account. Please try again.';

      if (error instanceof ApiError) {
        message = error.body.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setSubmitError(message);
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--ds-accent-bg-soft)', color: 'var(--ds-accent-text)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M6 8.5C6 6.01472 8.01472 4 10.5 4H13.5C15.9853 4 18 6.01472 18 8.5V9H6V8.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M4 11H20V16.5C20 18.9853 17.9853 21 15.5 21H8.5C6.01472 21 4 18.9853 4 16.5V11Z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            Start selling on WhatsApp in minutes
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Input
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            {...register('password')}
          />

          {submitError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          {isSuccess && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Account created. Redirecting to onboarding...
            </p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Create Account
          </Button>

          <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
            Continue with Google
          </Button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--ds-accent-text)' }}>
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
