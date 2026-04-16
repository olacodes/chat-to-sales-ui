import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * inputVariants — structural classes only.
 * Token colors (bg, text, border, ring) stay in inline styles
 * since they reference --ds-* CSS custom properties.
 */
export const inputVariants = cva(
  [
    'w-full rounded-lg border text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      inputSize: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { inputSize: 'md' },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, leftElement, rightElement, id, inputSize, className = '', ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replaceAll(' ', '-');
    const hasError = Boolean(error);

    let ariaDescribedBy: string | undefined;
    if (hasError) ariaDescribedBy = `${inputId}-error`;
    else if (hint) ariaDescribedBy = `${inputId}-hint`;

    let paddingClass = 'px-3';
    if (leftElement) paddingClass = 'pl-9 pr-3';
    else if (rightElement) paddingClass = 'pl-3 pr-9';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--ds-text-secondary)' }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <span
              className="absolute left-3 flex items-center pointer-events-none"
              style={{ color: 'var(--ds-text-tertiary)' }}
            >
              {leftElement}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy}
            className={inputVariants({ inputSize, className: `${paddingClass} ${className}` })}
            style={{
              backgroundColor: 'var(--ds-bg-surface)',
              color: 'var(--ds-text-primary)',
              borderColor: hasError ? 'var(--ds-danger-dot)' : 'var(--ds-border-base)',
              // @ts-expect-error CSS custom property
              '--tw-ring-color': hasError ? 'var(--ds-danger-dot)' : 'var(--ds-border-focus)',
            }}
            {...props}
          />

          {rightElement && (
            <span
              className="absolute right-3 flex items-center"
              style={{ color: 'var(--ds-text-tertiary)' }}
            >
              {rightElement}
            </span>
          )}
        </div>

        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs"
            style={{ color: 'var(--ds-danger-text)' }}
          >
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p
            id={`${inputId}-hint`}
            className="text-xs"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
