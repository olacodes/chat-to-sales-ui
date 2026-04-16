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

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

async function loginWithEmail(payload: LoginFormValues) {
  return apiClient.post('/api/v1/auth/login', payload);
}

export default function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSuccess(false);

    try {
      await loginWithEmail(values);
      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard'), 700);
    } catch (error) {
      let message = 'Invalid email or password.';

      if (error instanceof ApiError) {
        message = error.status === 401 ? 'Invalid email or password.' : error.body.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setSubmitError(message);
    }
  });

  return (
    <Card className="w-full max-w-md border-gray-200">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
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
          <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your ChatToSales account</p>
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
            placeholder="Your password"
            autoComplete="current-password"
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
              Signed in. Redirecting to dashboard...
            </p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Sign in
          </Button>

          <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
            Continue with Google
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
            Get started free
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
