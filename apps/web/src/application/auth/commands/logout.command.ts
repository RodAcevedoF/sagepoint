"use client";

import { logout } from "@/infrastructure/store/slices/authSlice";
import { useAppDispatch } from "@/common/hooks";
import { logoutAction } from "@/app/actions/auth";

export function useLogoutCommand() {
  const dispatch = useAppDispatch();

  const execute = async () => {
    dispatch(logout());
    await logoutAction();
  };

  return { execute };
}
