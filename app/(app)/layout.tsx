import { ShellClient } from '@/components/layout/ShellClient';

// Read at server render time — no client bundle exposure needed.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ShellClient tenantId={TENANT_ID}>{children}</ShellClient>;
}
