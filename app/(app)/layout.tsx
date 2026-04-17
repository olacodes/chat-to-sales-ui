import { ShellClient } from '@/components/layout/ShellClient';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ShellClient>{children}</ShellClient>;
}
