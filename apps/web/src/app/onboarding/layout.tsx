import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { OnboardingLayout } from "@/features/onboarding";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.onboardingStatus && user.onboardingStatus !== "PENDING") {
    redirect("/dashboard");
  }
  return <OnboardingLayout>{children}</OnboardingLayout>;
}
