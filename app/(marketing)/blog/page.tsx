import type { Metadata } from 'next';
import { BlogComingSoonContent } from '@/components/marketing/BlogComingSoon';

export const metadata: Metadata = {
  title: 'Blog — ChatToSales',
  description:
    'Deep dives, field tactics, and honest stories from the frontline of Nigerian commerce. Written by merchants, for merchants.',
  openGraph: {
    title: 'Blog — ChatToSales',
    description:
      'Deep dives, field tactics, and honest stories from the frontline of Nigerian commerce.',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogComingSoonContent />;
}
