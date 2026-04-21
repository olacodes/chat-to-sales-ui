import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SalesFlow — Turn every conversation into a closed deal',
  description:
    'SalesFlow qualifies leads, books demos, and moves prospects through your pipeline — automatically.',
};

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
