import { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftElement, rightElement, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 flex items-center text-gray-400 pointer-events-none">
              {leftElement}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={[
              'w-full rounded-lg border bg-white text-sm text-gray-900 placeholder:text-gray-400',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'h-9 px-3',
              leftElement ? 'pl-9' : '',
              rightElement ? 'pr-9' : '',
              hasError
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
              className,
            ]
              .join(' ')
              .trim()}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3 flex items-center text-gray-400">{rightElement}</span>
          )}
        </div>

        {hasError && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
