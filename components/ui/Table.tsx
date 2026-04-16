/**
 * Table — reusable data table primitives.
 *
 * Components
 * ─────────────────────────────────────────────────────────────
 *   Table        — outer <table> wrapper with scroll container
 *   TableHead    — <thead>
 *   TableBody    — <tbody>
 *   TableRow     — <tr> with hover state + optional onClick
 *   TableHeader  — <th> column header cell
 *   TableCell    — <td> data cell
 *
 * Usage
 * ─────────────────────────────────────────────────────────────
 *   <Table caption="Orders for June">
 *     <TableHead>
 *       <TableRow>
 *         <TableHeader>ID</TableHeader>
 *         <TableHeader align="right">Amount</TableHeader>
 *       </TableRow>
 *     </TableHead>
 *     <TableBody>
 *       {orders.map((o) => (
 *         <TableRow key={o.id} onClick={() => openOrder(o.id)}>
 *           <TableCell>{o.id}</TableCell>
 *           <TableCell align="right">{o.amount}</TableCell>
 *         </TableRow>
 *       ))}
 *     </TableBody>
 *   </Table>
 */

import { cva, type VariantProps } from 'class-variance-authority';

/* ── Cell alignment ──────────────────────────────────────────── */

const cellAlignVariants = cva('', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: { align: 'left' },
});

/* ── Table (scroll container + <table>) ─────────────────────── */

interface TableProps {
  children: React.ReactNode;
  /** Accessible caption — rendered visually hidden, read by screen readers. */
  caption?: string;
  className?: string;
}

export function Table({ children, caption, className = '' }: Readonly<TableProps>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm" style={{ color: 'var(--ds-text-primary)' }}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

/* ── TableHead ───────────────────────────────────────────────── */

interface TableSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: Readonly<TableSectionProps>) {
  return (
    <thead className={className} style={{ borderBottom: '1px solid var(--ds-border-base)' }}>
      {children}
    </thead>
  );
}

/* ── TableBody ───────────────────────────────────────────────── */

export function TableBody({ children, className = '' }: Readonly<TableSectionProps>) {
  return (
    <tbody className={`divide-y ${className}`} style={{ borderColor: 'var(--ds-border-base)' }}>
      {children}
    </tbody>
  );
}

/* ── TableRow ────────────────────────────────────────────────── */

interface TableRowProps {
  children: React.ReactNode;
  /** Makes the row interactive — adds pointer cursor, hover highlight, focus ring. */
  onClick?: () => void;
  /** Highlight row (e.g. selected state). */
  isSelected?: boolean;
  className?: string;
}

export function TableRow({
  children,
  onClick,
  isSelected = false,
  className = '',
}: Readonly<TableRowProps>) {
  const isClickable = Boolean(onClick);

  return (
    <tr
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={['transition-colors duration-100', isClickable ? 'cursor-pointer' : '', className]
        .join(' ')
        .trim()}
      style={{
        backgroundColor: isSelected ? 'var(--ds-brand-bg-soft)' : undefined,
      }}
      onMouseEnter={
        isClickable
          ? (e) => (e.currentTarget.style.backgroundColor = 'var(--ds-bg-hover)')
          : undefined
      }
      onMouseLeave={
        isClickable
          ? (e) =>
              (e.currentTarget.style.backgroundColor = isSelected ? 'var(--ds-brand-bg-soft)' : '')
          : undefined
      }
    >
      {children}
    </tr>
  );
}

/* ── Sort direction type ─────────────────────────────────────── */

type SortDirection = 'asc' | 'desc' | 'none';

/* ── aria-sort helper ────────────────────────────────────────── */

function getAriaSortValue(dir: SortDirection): 'ascending' | 'descending' | 'none' {
  if (dir === 'asc') return 'ascending';
  if (dir === 'desc') return 'descending';
  return 'none';
}

/* ── TableHeader (<th>) ──────────────────────────────────────── */

interface TableHeaderProps extends VariantProps<typeof cellAlignVariants> {
  children: React.ReactNode;
  /** Column width — passed directly to style (e.g. '120px', '15%'). */
  width?: string;
  /** Make column sortable — renders sort indicator. */
  sortable?: boolean;
  /** Current sort direction for this column. */
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
}

export function TableHeader({
  children,
  align,
  width,
  sortable = false,
  sortDirection = 'none',
  onSort,
  className = '',
}: Readonly<TableHeaderProps>) {
  const Tag = sortable ? 'button' : 'div';

  return (
    <th
      scope="col"
      aria-sort={sortable ? getAriaSortValue(sortDirection) : undefined}
      className={[
        'px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap',
        cellAlignVariants({ align }),
        className,
      ]
        .join(' ')
        .trim()}
      style={{
        color: 'var(--ds-text-secondary)',
        backgroundColor: 'var(--ds-bg-sunken)',
        width,
      }}
    >
      {sortable ? (
        <Tag
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
          aria-label={`Sort by ${String(children)}`}
        >
          {children}
          <SortIcon direction={sortDirection} />
        </Tag>
      ) : (
        children
      )}
    </th>
  );
}

function SortIcon({ direction }: Readonly<{ direction: SortDirection }>) {
  return (
    <span className="flex flex-col gap-px" aria-hidden="true">
      <svg
        className="h-2.5 w-2.5"
        viewBox="0 0 10 10"
        fill="currentColor"
        style={{
          opacity: direction === 'asc' ? 1 : 0.3,
        }}
      >
        <path d="M5 2L9 8H1L5 2Z" />
      </svg>
      <svg
        className="h-2.5 w-2.5"
        viewBox="0 0 10 10"
        fill="currentColor"
        style={{
          opacity: direction === 'desc' ? 1 : 0.3,
        }}
      >
        <path d="M5 8L1 2H9L5 8Z" />
      </svg>
    </span>
  );
}

/* ── TableCell (<td>) ────────────────────────────────────────── */

interface TableCellProps extends VariantProps<typeof cellAlignVariants> {
  children: React.ReactNode;
  /** Mute the cell content (e.g. secondary metadata). */
  muted?: boolean;
  /** Prevent line-breaking — good for amounts, IDs, dates. */
  noWrap?: boolean;
  className?: string;
}

export function TableCell({
  children,
  align,
  muted = false,
  noWrap = false,
  className = '',
}: Readonly<TableCellProps>) {
  return (
    <td
      className={[
        'px-4 py-3 text-sm',
        cellAlignVariants({ align }),
        noWrap ? 'whitespace-nowrap' : '',
        className,
      ]
        .join(' ')
        .trim()}
      style={{ color: muted ? 'var(--ds-text-secondary)' : 'var(--ds-text-primary)' }}
    >
      {children}
    </td>
  );
}
