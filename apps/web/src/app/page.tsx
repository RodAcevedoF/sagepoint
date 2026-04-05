import { LandingPage } from "@/features/landing/components/LandingPage";
import { AuthRedirect } from "@/features/auth/components/AuthRedirect";

export default function Home() {
  return (
    <>
      <AuthRedirect to="/dashboard" />
      <LandingPage />
    </>
  );
}
