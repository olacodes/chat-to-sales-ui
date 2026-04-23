'use client';

import { useState } from 'react';
import { useTeamMembers, useCreateInvite, useRemoveMember } from '@/hooks/useTeam';
import { useAuthStore } from '@/store/useAuthStore';

/** Derive the invite link from just the token */
function inviteUrl(token: string): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}`
      : process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base}/invite/${token}`;
}

export function TeamSection() {
  const { data: members = [], isLoading } = useTeamMembers();
  const { mutate: createInvite, isPending: isCreating } = useCreateInvite();
  const { mutate: removeMember } = useRemoveMember();
  const currentUserId = useAuthStore((s) => s.user?.user_id);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleGenerateLink() {
    createInvite(undefined, {
      onSuccess: (data) => {
        setInviteLink(inviteUrl(data.token));
        setCopied(false);
      },
    });
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleRemove(userId: string) {
    setRemovingId(userId);
    removeMember(userId, {
      onSettled: () => setRemovingId(null),
    });
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-5"
      style={{ borderColor: 'var(--ds-border-default)', background: 'var(--ds-bg-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            Team members
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            Invite sales reps to join your workspace.
          </p>
        </div>

        <button
          onClick={handleGenerateLink}
          disabled={isCreating}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-60"
          style={{ background: 'var(--ds-accent)', color: '#fff' }}
        >
          {isCreating ? 'Generating…' : '+ Invite link'}
        </button>
      </div>

      {/* Invite link box */}
      {inviteLink && (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--ds-border-default)', background: 'var(--ds-bg-subtle)' }}
        >
          <span
            className="flex-1 truncate font-mono text-xs"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {inviteLink}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors"
            style={{
              background: copied ? 'var(--ds-accent)' : 'var(--ds-bg-hover)',
              color: copied ? '#fff' : 'var(--ds-text-primary)',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Members list */}
      {isLoading ? (
        <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
          Loading members…
        </p>
      ) : members.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
          No team members yet. Generate an invite link to add someone.
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--ds-border-default)' }}>
          {members.map((m) => {
            const isYou = m.id === currentUserId;
            const isOwner = m.role === 'owner';
            return (
              <li key={m.id} className="flex items-center gap-3 py-2.5">
                {/* Avatar placeholder */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase"
                  style={{ background: 'var(--ds-accent-subtle)', color: 'var(--ds-accent)' }}
                >
                  {(m.displayName ?? m.email).charAt(0)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                    {m.displayName ?? m.email}
                    {isYou && (
                      <span
                        className="ml-1.5 text-xs font-normal"
                        style={{ color: 'var(--ds-text-tertiary)' }}
                      >
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                    {m.email}
                  </p>
                </div>

                {/* Role badge */}
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                  style={{
                    background: isOwner ? 'var(--ds-accent-subtle)' : 'var(--ds-bg-subtle)',
                    color: isOwner ? 'var(--ds-accent)' : 'var(--ds-text-secondary)',
                  }}
                >
                  {m.role}
                </span>

                {/* Remove button — owners and self cannot be removed */}
                {!isOwner && !isYou && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={removingId === m.id}
                    className="shrink-0 rounded p-1 text-xs transition-opacity disabled:opacity-40 hover:opacity-70"
                    style={{ color: 'var(--ds-text-tertiary)' }}
                    title="Remove member"
                  >
                    {removingId === m.id ? '…' : '✕'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
