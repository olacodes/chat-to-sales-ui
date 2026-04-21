import { Navbar } from '@/components/marketing/Navbar';
import { HeroSection } from '@/components/marketing/HeroSection';
import {
  FeaturesStrip,
  StatsBar,
  LogoBar,
  CtaBanner,
  Footer,
} from '@/components/marketing/Sections';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: 'var(--ds-bg-base)' }}>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesStrip />
        <LogoBar />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
