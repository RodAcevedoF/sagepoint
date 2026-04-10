import { PublicLayout } from "@/shared/components";
import { HeroSection } from "./sections/HeroSection";
import { FeaturesSection } from "./sections/FeaturesSection";

export function LandingPage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
    </PublicLayout>
  );
}
