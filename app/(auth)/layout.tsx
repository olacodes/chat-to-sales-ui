import { Navbar } from '@/components/marketing/Navbar';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--ds-bg-base)' }}
    >
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 py-10 pt-24 sm:px-6">
        {children}
      </div>
    </div>
  );
}
