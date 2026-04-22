'use client';

import { useState, useEffect } from 'react';
import { useReportConfig, useUpdateReportConfig, useSendPreview } from '@/hooks/useReports';

export function WeeklyReportCard() {
  const { data: config, isLoading } = useReportConfig();
  const { mutate: updateConfig, isPending: isSaving } = useUpdateReportConfig();
  const { mutate: sendPreview, isPending: isSending, isSuccess: previewSent, error: previewError } =
    useSendPreview();

  const [enabled, setEnabled] = useState(false);
  const [phone, setPhone] = useState('');

  // Sync local state when config loads
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setPhone(config.recipient_phone ?? '');
    }
  }, [config]);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    updateConfig({ enabled: next });
  }

  function handlePhoneBlur() {
    const trimmed = phone.trim();
    const current = config?.recipient_phone ?? '';
    if (trimmed !== current) {
      updateConfig({ recipient_phone: trimmed || null });
    }
  }

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-5 animate-pulse"
        style={{
          backgroundColor: 'var(--ds-bg-surface)',
          border: '1px solid var(--ds-border-base)',
          height: 160,
        }}
      />
    );
  }

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        backgroundColor: 'var(--ds-bg-surface)',
        border: '1px solid var(--ds-border-base)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
            Weekly Business Report
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            Receive a Monday morning WhatsApp summary — leads, revenue, top customers, and
            conversations that need your attention.
          </p>
        </div>

        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Enable weekly report"
          onClick={handleToggle}
          disabled={isSaving}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
          style={{
            backgroundColor: enabled ? 'var(--ds-brand-bg)' : 'var(--ds-bg-elevated)',
          }}
        >
          <span
            className="pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-200"
            style={{
              backgroundColor: 'white',
              transform: enabled ? 'translateX(16px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>

      {/* Recipient phone */}
      <div>
        <label
          htmlFor="report-phone"
          className="block mb-1 text-xs font-medium"
          style={{ color: 'var(--ds-text-secondary)' }}
        >
          Report recipient (WhatsApp number)
        </label>
        <input
          id="report-phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="+2348012345678"
          className="w-full max-w-xs rounded-lg px-3 py-2 text-sm focus:outline-none transition-shadow"
          style={{
            border: '1px solid var(--ds-border-base)',
            backgroundColor: 'var(--ds-bg-surface)',
            color: 'var(--ds-text-primary)',
          }}
        />
        <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
          Sent every Monday at 8 AM (Africa/Lagos). Use E.164 format, e.g. +2348012345678
        </p>
      </div>

      {/* Send preview */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => sendPreview()}
          disabled={isSending || !config?.recipient_phone}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: '1px solid var(--ds-border-base)',
            color: 'var(--ds-text-secondary)',
            backgroundColor: 'var(--ds-bg-surface)',
          }}
          onMouseEnter={(e) => {
            if (!isSending && config?.recipient_phone) {
              e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)';
              e.currentTarget.style.color = 'var(--ds-text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-bg-surface)';
            e.currentTarget.style.color = 'var(--ds-text-secondary)';
          }}
        >
          {isSending ? 'Sending preview…' : 'Send preview now'}
        </button>

        {previewSent && (
          <p className="text-xs" style={{ color: 'var(--ds-success-text)' }}>
            ✓ Preview sent to {config?.recipient_phone}
          </p>
        )}
        {previewError && (
          <p className="text-xs" style={{ color: 'var(--ds-danger-text)' }}>
            {previewError.message}
          </p>
        )}
      </div>
    </div>
  );
}
