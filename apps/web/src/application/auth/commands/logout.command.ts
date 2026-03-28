"use client";

import { logout } from "@/infrastructure/store/slices/authSlice";
import { useAppDispatch } from "@/common/hooks";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export function useLogoutCommand() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const execute = async () => {
    await logoutAction();
    router.push("/login");
    dispatch(logout());
  };

  return { execute };
}
