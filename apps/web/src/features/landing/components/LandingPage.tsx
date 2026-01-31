import { PublicLayout } from '@/common/components';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AuthRedirect } from './AuthRedirect';

export function LandingPage() {
  return (
    <PublicLayout>
      <AuthRedirect />
      <HeroSection />
      <FeaturesSection />
    </PublicLayout>
  );
}
