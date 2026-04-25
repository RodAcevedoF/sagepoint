import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { AppShell } from "@/shared/components/layout/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.onboardingStatus === "PENDING") redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
