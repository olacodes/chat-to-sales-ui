import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      {/* Theme toggle — top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
