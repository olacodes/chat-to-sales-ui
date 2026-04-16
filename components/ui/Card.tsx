import { cva, type VariantProps } from 'class-variance-authority';

/**
 * cardVariants — layout variants for the Card wrapper.
 * Surface colors stay in inline styles (CSS variable references).
 */
export const cardVariants = cva('rounded-xl overflow-hidden', {
  variants: {
    /** Controls shadow depth */
    shadow: {
      none: '',
      xs: '[box-shadow:var(--ds-shadow-xs)]',
      sm: '[box-shadow:var(--ds-shadow-sm)]',
      md: '[box-shadow:var(--ds-shadow-md)]',
    },
    /** Removes the border in contexts where it's not needed */
    bordered: {
      true: 'border [border-color:var(--ds-border-base)]',
      false: '',
    },
  },
  defaultVariants: { shadow: 'xs', bordered: true },
});

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, shadow, bordered, className = '' }: Readonly<CardProps>) {
  return (
    <div
      className={cardVariants({ shadow, bordered, className })}
      style={{ backgroundColor: 'var(--ds-bg-surface)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
}: Readonly<CardHeaderProps>) {
  return (
    <div
      className={`flex items-start justify-between px-5 py-4 ${className}`}
      style={{ borderBottom: '1px solid var(--ds-border-base)' }}
    >
      <div className="min-w-0">
        <h3
          className="text-sm font-semibold leading-tight"
          style={{ color: 'var(--ds-text-primary)' }}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '', noPadding = false }: Readonly<CardBodyProps>) {
  return <div className={noPadding ? className : `px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: Readonly<CardFooterProps>) {
  return (
    <div
      className={`px-5 py-3 ${className}`}
      style={{
        backgroundColor: 'var(--ds-bg-sunken)',
        borderTop: '1px solid var(--ds-border-base)',
      }}
    >
      {children}
    </div>
  );
}
