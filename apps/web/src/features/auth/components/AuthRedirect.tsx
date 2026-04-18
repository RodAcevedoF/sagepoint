"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/shared/hooks";

interface AuthRedirectProps {
  to: string;
}

export function AuthRedirect({ to }: AuthRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !searchParams.get("stay")) {
      router.replace(to);
    }
  }, [isAuthenticated, isLoading, router, to, searchParams]);

  return null;
}
