"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/common/hooks";

interface AuthRedirectProps {
  to: string;
}

/**
 * Client-side redirect for authenticated users.
 * Unlike server-side cookie checks, this only redirects when
 * the auth state is fully resolved (profile fetched successfully).
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
