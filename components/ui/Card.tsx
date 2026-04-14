interface CardProps {
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

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between px-5 py-4 border-b border-gray-100 ${className}`}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '', noPadding = false }: CardBodyProps) {
  return <div className={noPadding ? className : `px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-5 py-3 bg-gray-50 border-t border-gray-100 ${className}`}>{children}</div>
  );
}
