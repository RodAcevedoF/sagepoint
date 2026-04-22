"use client";

import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/infrastructure/api/authApi";
import { useCommand } from "@/application/common";

export function useRegisterCommand() {
  const router = useRouter();
  const cmd = useCommand(useRegisterMutation, {
    onSuccess: () => router.push("/login?registered=true"),
  });
  return {
    ...cmd,
    execute: (name: string, email: string, password: string) =>
      cmd.execute({ email, password, name }),
  };
}
