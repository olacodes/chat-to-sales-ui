import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChatToSales — Turn every conversation into a closed deal',
  description:
    'ChatToSales qualifies leads, books demos, and moves prospects through your pipeline — automatically.',
};

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
