"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/shared/components";
import { useAppSelector } from "@/shared/hooks";

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that should only be accessible to guests (non-authenticated users).
 * Redirects to /dashboard if already authenticated.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return <Loader variant="page" sx={{ minHeight: "100vh" }} />;
  }

  return <>{children}</>;
}
