"use client";

import { useAppDispatch } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { authApi } from "@/infrastructure/api/authApi";

export function useLogoutCommand() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const execute = async () => {
    await logoutAction();
    dispatch(authApi.util.resetApiState());
    router.replace("/login");
  };

  return { execute };
}
