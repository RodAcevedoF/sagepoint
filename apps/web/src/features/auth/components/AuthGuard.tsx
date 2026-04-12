"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "@/shared/components";
import { useAppSelector } from "@/shared/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Single source of truth for the onboarding gate:
 *  - PENDING users are redirected to /onboarding (unless already there)
 *  - COMPLETED/SKIPPED users on /onboarding are redirected to /dashboard
 *  - Unauthenticated users are redirected to /login
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth,
  );

  const isOnboarding = pathname.startsWith("/onboarding");
  const status = user?.onboardingStatus ?? "PENDING";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (status === "PENDING" && !isOnboarding) {
      router.replace("/onboarding");
    } else if (status !== "PENDING" && isOnboarding) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, status, router, isOnboarding]);

  if (isLoading || !isAuthenticated) {
    return <Loader variant="page" sx={{ minHeight: "100vh" }} />;
  }

  // Block render until redirect settles — prevents dashboard flash
  if (status === "PENDING" && !isOnboarding) {
    return <Loader variant="page" sx={{ minHeight: "100vh" }} />;
  }
  if (status !== "PENDING" && isOnboarding) {
    return <Loader variant="page" sx={{ minHeight: "100vh" }} />;
  }

  return <>{children}</>;
}
