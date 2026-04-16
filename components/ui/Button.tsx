import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand';
type Size = 'xs' | 'sm' | 'md' | 'lg';

/**
 * cva definition — single source of truth for variant + size classes.
 * Use `buttonVariants` directly when you need class strings without the
 * component (e.g. inside an <a> or Next.js <Link>).
 */
export const buttonVariants = cva(
  // Base classes applied to every variant
  [
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none',
  ],
  {
    variants: {
      variant: {
        brand:
          '[background-color:var(--ds-brand-bg)] text-white border border-transparent ' +
          'hover:[background-color:var(--ds-brand-bg-hover)] active:brightness-90 ' +
          '[--tw-ring-color:var(--ds-brand-bg)]',
        primary:
          '[background-color:var(--ds-accent-bg)] text-white border border-transparent ' +
          'hover:[background-color:var(--ds-accent-bg-hover)] active:brightness-90 ' +
          '[--tw-ring-color:var(--ds-accent-bg)]',
        secondary:
          '[background-color:var(--ds-bg-sunken)] [color:var(--ds-text-primary)] ' +
          'border border-transparent hover:[background-color:var(--ds-bg-active)] ' +
          '[--tw-ring-color:var(--ds-border-strong)]',
        outline:
          '[background-color:var(--ds-bg-surface)] [color:var(--ds-text-primary)] ' +
          'border [border-color:var(--ds-border-base)] ' +
          'hover:[background-color:var(--ds-bg-hover)] ' +
          '[--tw-ring-color:var(--ds-border-strong)]',
        ghost:
          'bg-transparent [color:var(--ds-text-secondary)] border border-transparent ' +
          'hover:[background-color:var(--ds-bg-hover)] hover:[color:var(--ds-text-primary)] ' +
          '[--tw-ring-color:var(--ds-border-strong)]',
        danger:
          '[background-color:var(--ds-danger-dot)] text-white border border-transparent ' +
          'hover:brightness-90 active:brightness-75 ' +
          '[--tw-ring-color:var(--ds-danger-dot)]',
      } satisfies Record<Variant, string>,
      size: {
        xs: 'h-6 px-2.5 text-xs gap-1',
        sm: 'h-7 px-3 text-xs gap-1.5',
        md: 'h-9 px-4 text-sm gap-2',
        lg: 'h-11 px-5 text-base gap-2',
      } satisfies Record<Size, string>,
    },
    defaultVariants: {
      variant: 'brand',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * DS Button
 * ─────────────────────────────────────────────────────
 * Variants (via cva)
 *   brand    — commerce green, primary action in most contexts
 *   primary  — indigo, secondary interactive (links, auth CTAs)
 *   secondary — neutral filled
 *   outline  — bordered, transparent background
 *   ghost    — no border, no background
 *   danger   — destructive actions
 *
 * All colors reference --ds-* tokens from globals.css
 * so dark mode works without per-component overrides.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'brand',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
