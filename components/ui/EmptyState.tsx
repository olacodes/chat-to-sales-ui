/**
 * EmptyState — friendly zero-data placeholder.
 *
 * Usage:
 *   <EmptyState
 *     icon={<InboxIcon />}
 *     title="Your inbox is empty"
 *     description="Connect a WhatsApp number to start receiving messages."
 *     action={<Button>Connect Channel</Button>}
 *   />
 */

interface EmptyStateProps {
  /** Icon rendered in a rounded container. Keep to 20–24px SVGs. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary action button or link. */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: Readonly<EmptyStateProps>) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-8 py-16 ${className}`}
    >
      {icon && (
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: 'var(--ds-bg-sunken)',
            color: 'var(--ds-text-tertiary)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold" style={{ color: 'var(--ds-text-primary)' }}>
        {title}
      </h3>

      {description && (
        <p
          className="mt-1.5 text-sm max-w-xs leading-relaxed"
          style={{ color: 'var(--ds-text-secondary)' }}
        >
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
