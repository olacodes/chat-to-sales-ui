'use client';

import { useEffect, useRef } from 'react';
import { getSnoozePresets } from '@/lib/utils/snoozePresets';

interface SnoozePopoverProps {
  onSelect: (isoString: string) => void;
  onClose: () => void;
  /** Position hint — 'down' renders below the trigger, 'up' renders above */
  direction?: 'down' | 'up';
}

export function SnoozePopover({ onSelect, onClose, direction = 'down' }: Readonly<SnoozePopoverProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const presets = getSnoozePresets();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Snooze options"
      className="absolute z-50 w-48 rounded-xl shadow-lg overflow-hidden"
      style={{
        border: '1px solid var(--ds-border-base)',
        backgroundColor: 'var(--ds-bg-surface)',
        ...(direction === 'up' ? { bottom: '100%', marginBottom: '4px' } : { top: '100%', marginTop: '4px' }),
        right: 0,
      }}
    >
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--ds-border-subtle)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ds-text-tertiary)' }}>
          Send later
        </p>
      </div>
      {presets.map((preset) => (
        <button
          key={preset.isoString}
          type="button"
          role="menuitem"
          onClick={() => { onSelect(preset.isoString); onClose(); }}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>
            {preset.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
            {preset.sublabel}
          </span>
        </button>
      ))}
    </div>
  );
}
