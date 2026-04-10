"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/shared/components";
import { useAppSelector } from "@/shared/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to /login if not authenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <Loader variant="page" sx={{ minHeight: "100vh" }} />;
  }

  return <>{children}</>;
}
