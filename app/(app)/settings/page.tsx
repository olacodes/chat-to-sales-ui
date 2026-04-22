'use client';

import { WeeklyReportCard } from '@/components/reports/WeeklyReportCard';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          Manage your workspace preferences.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--ds-text-tertiary)' }}>
          Notifications
        </h2>
        <WeeklyReportCard />
      </section>
    </div>
  );
}
