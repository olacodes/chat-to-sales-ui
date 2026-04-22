'use client';

import { useRef, useState, useEffect } from 'react';
import type { StaffMember } from '@/store';

interface AssignmentPanelProps {
  assignedTo: StaffMember | null;
  staff: StaffMember[];
  currentUserId: string | null;
  isAssigning: boolean;
  onAssign: (userId: string | null, staffMember: StaffMember | null) => void;
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function StaffAvatar({
  member,
  size = 'sm',
}: {
  member: StaffMember;
  size?: 'sm' | 'xs';
}) {
  const initials = getInitials(member.displayName, member.email);
  const dim = size === 'xs' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-[11px]';
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{
        backgroundColor: 'var(--ds-brand-bg-soft)',
        color: 'var(--ds-brand-text)',
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function AssignmentPanel({
  assignedTo,
  staff,
  currentUserId,
  isAssigning,
  onAssign,
}: Readonly<AssignmentPanelProps>) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const isUnassigned = assignedTo === null;
  const isAssignedToMe = assignedTo?.id === currentUserId;

  function handleSelect(member: StaffMember | null) {
    setOpen(false);
    onAssign(member?.id ?? null, member);
  }

  return (
    <div className="relative flex items-center gap-2 shrink-0" ref={panelRef}>
      {/* Claim button — shown when unassigned and current user is logged in */}
      {isUnassigned && currentUserId && !isAssigning && (
        <button
          type="button"
          onClick={() => {
            const me = staff.find((s) => s.id === currentUserId) ?? null;
            if (me) handleSelect(me);
          }}
          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--ds-brand-bg-soft)',
            color: 'var(--ds-brand-text)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Claim
        </button>
      )}

      {/* Assignment trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isAssigning}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-50"
        style={{
          border: '1px solid var(--ds-border-base)',
          color: 'var(--ds-text-secondary)',
          backgroundColor: 'var(--ds-bg-surface)',
        }}
        onMouseEnter={(e) => !isAssigning && (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-surface)')}
      >
        {isAssigning ? (
          <span style={{ color: 'var(--ds-text-tertiary)' }}>Assigning…</span>
        ) : assignedTo ? (
          <>
            <StaffAvatar member={assignedTo} size="xs" />
            <span className="max-w-[80px] truncate font-medium" style={{ color: 'var(--ds-text-primary)' }}>
              {isAssignedToMe ? 'You' : (assignedTo.displayName ?? assignedTo.email)}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--ds-text-tertiary)' }}>Unassigned</span>
        )}
        {/* Chevron */}
        <svg
          className="h-3 w-3 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg py-1 shadow-lg"
          style={{
            backgroundColor: 'var(--ds-bg-surface)',
            border: '1px solid var(--ds-border-base)',
          }}
          role="listbox"
          aria-label="Assign conversation to"
        >
          {/* Unassign option */}
          <button
            type="button"
            role="option"
            aria-selected={isUnassigned}
            onClick={() => handleSelect(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
            style={{ color: 'var(--ds-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <div
              className="h-5 w-5 rounded-full border-2 border-dashed shrink-0"
              style={{ borderColor: 'var(--ds-border-base)' }}
              aria-hidden="true"
            />
            <span>Unassign</span>
          </button>

          {staff.length > 0 && (
            <div
              className="mx-3 my-1"
              style={{ borderTop: '1px solid var(--ds-border-subtle)' }}
              role="separator"
            />
          )}

          {/* Staff list */}
          {staff.map((member) => {
            const isSelected = assignedTo?.id === member.id;
            const isMe = member.id === currentUserId;
            const label = isMe
              ? `${member.displayName ?? member.email} (You)`
              : (member.displayName ?? member.email);
            return (
              <button
                key={member.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(member)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                style={{
                  backgroundColor: isSelected ? 'var(--ds-bg-hover)' : '',
                  color: 'var(--ds-text-primary)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? 'var(--ds-bg-hover)' : '')}
              >
                <StaffAvatar member={member} size="xs" />
                <span className="truncate">{label}</span>
                {isSelected && (
                  <svg
                    className="h-3 w-3 ml-auto shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    style={{ color: 'var(--ds-brand-text)' }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}

          {staff.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              No staff members found
            </p>
          )}
        </div>
      )}
    </div>
  );
}
