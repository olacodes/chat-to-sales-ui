import { cva, type VariantProps } from 'class-variance-authority';

/**
 * badgeVariants — layout/size structure via cva.
 * Colors remain in inline styles because they reference --ds-* CSS variables
 * which Tailwind's JIT cannot resolve at build time.
 */
export const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full whitespace-nowrap border',
  {
    variants: {
      size: {
        sm: 'text-[11px] px-2 py-0.5 gap-1',
        md: 'text-xs px-2.5 py-1 gap-1.5',
      },
    },
    defaultVariants: { size: 'sm' },
  },
);

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'brand';

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

type TokenSet = { bg: string; text: string; border: string; dot: string };

const variantTokens: Record<BadgeVariant, TokenSet> = {
  default: {
    bg: 'var(--ds-bg-sunken)',
    text: 'var(--ds-text-secondary)',
    border: 'var(--ds-border-base)',
    dot: 'var(--ds-text-tertiary)',
  },
  brand: {
    bg: 'var(--ds-brand-bg-soft)',
    text: 'var(--ds-brand-text)',
    border: 'var(--ds-brand-border)',
    dot: 'var(--ds-success-dot)',
  },
  success: {
    bg: 'var(--ds-success-bg)',
    text: 'var(--ds-success-text)',
    border: 'var(--ds-success-border)',
    dot: 'var(--ds-success-dot)',
  },
  warning: {
    bg: 'var(--ds-warning-bg)',
    text: 'var(--ds-warning-text)',
    border: 'var(--ds-warning-border)',
    dot: 'var(--ds-warning-dot)',
  },
  danger: {
    bg: 'var(--ds-danger-bg)',
    text: 'var(--ds-danger-text)',
    border: 'var(--ds-danger-border)',
    dot: 'var(--ds-danger-dot)',
  },
  info: {
    bg: 'var(--ds-info-bg)',
    text: 'var(--ds-info-text)',
    border: 'var(--ds-info-border)',
    dot: 'var(--ds-info-dot)',
  },
  outline: {
    bg: 'var(--ds-bg-surface)',
    text: 'var(--ds-text-secondary)',
    border: 'var(--ds-border-strong)',
    dot: 'var(--ds-text-tertiary)',
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  className = '',
}: Readonly<BadgeProps>) {
  const t = variantTokens[variant];
  return (
    <span
      className={badgeVariants({ size, className })}
      style={{ backgroundColor: t.bg, color: t.text, borderColor: t.border }}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${pulse ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: t.dot }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
