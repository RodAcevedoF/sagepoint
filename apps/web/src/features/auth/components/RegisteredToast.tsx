"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "@/shared/components";

export function RegisteredToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (searchParams.get("registered") !== "true") return;

    showSnackbar("Account created. Check your email to verify your account.", {
      severity: "success",
      duration: 6000,
    });

    const next = new URLSearchParams(searchParams);
    next.delete("registered");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, showSnackbar, router, pathname]);

  return null;
}
