'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { staffApi } from '@/lib/api/endpoints/staff';
import { applyInviteSession } from '@/lib/auth/service';
import { ApiError } from '@/lib/api/client';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: Props) {
  const { token } = use(params);
  const router = useRouter();

  // ── Token validation ─────────────────────────────────────────────────────
  const [tokenState, setTokenState] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    let cancelled = false;
    staffApi
      .getInvite(token)
      .then(() => { if (!cancelled) setTokenState('valid'); })
      .catch(() => { if (!cancelled) setTokenState('invalid'); });
    return () => { cancelled = true; };
  }, [token]);

  // ── Form state ───────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await staffApi.acceptInvite(token, { name, email, password });
      applyInviteSession(result);
      setDone(true);
      setTimeout(() => router.push('/conversations'), 800);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.body.message ?? 'Something went wrong. Please try again.');
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (tokenState === 'loading') {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            Validating invite link…
          </p>
        </CardBody>
      </Card>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="p-8 text-center space-y-3">
          <p className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            Invite link invalid or expired
          </p>
          <p className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            Ask your workspace owner to generate a new invite link.
          </p>
        </CardBody>
      </Card>
    );
  }

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
            Join the workspace
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
            Create your account to get started.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Your name"
            placeholder="Ada Okonkwo"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isSubmitting}
          />
          <Input
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isSubmitting}
          />

          {submitError && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--ds-danger-bg)', color: 'var(--ds-danger-text)' }}
            >
              {submitError}
            </p>
          )}

          {done && (
            <p
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--ds-success-bg)', color: 'var(--ds-success-text)' }}
            >
              Account created! Taking you in…
            </p>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
            Create account & join
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
