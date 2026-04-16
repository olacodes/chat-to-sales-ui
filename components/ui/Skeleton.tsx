/**
 * Skeleton loaders — shimmer placeholders that mirror real content shapes.
 * Use these while data is fetching to prevent layout shift and improve
 * perceived performance.
 *
 * Components:
 *   Skeleton               — raw block (arbitrary shape)
 *   SkeletonConversationList — 6-item conversation list placeholder
 *   SkeletonMessageThread  — 6-bubble thread placeholder
 *   SkeletonKpiCard        — dashboard KPI card placeholder
 *   SkeletonTableRows      — n-row table placeholder
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Primitive skeleton block — use className to set dimensions and border-radius. */
export function Skeleton({ className = '', style }: Readonly<SkeletonProps>) {
  return <div className={`skeleton-shimmer ${className}`} style={style} aria-hidden="true" />;
}

/** Mirrors the ConversationListItem layout — renders 6 placeholder rows. */
const CONV_SKEL_KEYS = ['sk-cv-a', 'sk-cv-b', 'sk-cv-c', 'sk-cv-d', 'sk-cv-e', 'sk-cv-f'] as const;

export function SkeletonConversationList() {
  return (
    <div
      className="flex flex-col divide-y"
      style={{ borderColor: 'var(--ds-border-base)' }}
      aria-busy="true"
      aria-label="Loading conversations"
    >
      {CONV_SKEL_KEYS.map((key) => (
        <div key={key} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 py-0.5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-2.5 w-10 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded" />
            <Skeleton className="h-2.5 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors the message thread — alternating left/right bubbles. */
const MSG_SKEL_ROWS: Array<{ id: string; out: boolean; lineIds: string[] }> = [
  { id: 'sk-m-1', out: false, lineIds: ['sk-m-1-a', 'sk-m-1-b'] },
  { id: 'sk-m-2', out: true, lineIds: ['sk-m-2-a'] },
  { id: 'sk-m-3', out: false, lineIds: ['sk-m-3-a', 'sk-m-3-b', 'sk-m-3-c'] },
  { id: 'sk-m-4', out: true, lineIds: ['sk-m-4-a', 'sk-m-4-b'] },
  { id: 'sk-m-5', out: false, lineIds: ['sk-m-5-a'] },
  { id: 'sk-m-6', out: true, lineIds: ['sk-m-6-a', 'sk-m-6-b'] },
];

export function SkeletonMessageThread() {
  return (
    <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Loading messages">
      {MSG_SKEL_ROWS.map(({ id, out, lineIds }) => (
        <div key={id} className={`flex items-end gap-2 ${out ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className={`flex flex-col gap-1.5 max-w-[60%] ${out ? 'items-end' : 'items-start'}`}>
            {lineIds.map((lineId, pos) => {
              const isLastShort = pos === lineIds.length - 1 && lineIds.length > 1;
              return (
                <Skeleton
                  key={lineId}
                  className={`h-9 rounded-2xl ${isLastShort ? 'w-3/4' : 'w-full'}`}
                  style={{ minWidth: '100px' }}
                />
              );
            })}
            <Skeleton className="h-2.5 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors a single dashboard KPI card. */
export function SkeletonKpiCard() {
  return (
    <div
      className="rounded-xl px-5 py-4 space-y-3"
      style={{
        backgroundColor: 'var(--ds-bg-surface)',
        border: '1px solid var(--ds-border-base)',
      }}
      aria-busy="true"
    >
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-7 w-16 rounded" />
      <Skeleton className="h-2.5 w-32 rounded" />
    </div>
  );
}

/** Mirrors an n-row data table. Max 12 rows rendered. */
const TABLE_SKEL_KEYS = [
  'sk-tr-0',
  'sk-tr-1',
  'sk-tr-2',
  'sk-tr-3',
  'sk-tr-4',
  'sk-tr-5',
  'sk-tr-6',
  'sk-tr-7',
  'sk-tr-8',
  'sk-tr-9',
  'sk-tr-10',
  'sk-tr-11',
] as const;

export function SkeletonTableRows({ rows = 8 }: Readonly<{ rows?: number }>) {
  const clampedRows = Math.min(rows, TABLE_SKEL_KEYS.length);
  return (
    <div
      className="divide-y"
      style={{ borderColor: 'var(--ds-border-base)' }}
      aria-busy="true"
      aria-label="Loading data"
    >
      {TABLE_SKEL_KEYS.slice(0, clampedRows).map((key) => (
        <div key={key} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 flex-1 max-w-[200px] rounded" />
          <Skeleton className="h-3 w-24 rounded hidden sm:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded hidden md:block" />
        </div>
      ))}
    </div>
  );
}
