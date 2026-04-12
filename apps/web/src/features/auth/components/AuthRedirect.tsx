"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/hooks";

interface AuthRedirectProps {
  to: string;
}

/**
 * Client-side redirect for authenticated users.
 * Redirects to `to` when auth state is resolved.
 * AuthGuard handles the onboarding gate from there.
 */
export function AuthRedirect({ to }: AuthRedirectProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(to);
    }
  }, [isAuthenticated, isLoading, router, to]);

  return null;
}
