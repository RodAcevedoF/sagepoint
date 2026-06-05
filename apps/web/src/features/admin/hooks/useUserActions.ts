"use client";

import { useAdminSnackbar } from "./useAdminSnackbar";
import { useAdminUserMenu } from "./userActions/useAdminUserMenu";
import { useBanUserAction } from "./userActions/useBanUserAction";
import { useRoleUserAction } from "./userActions/useRoleUserAction";
import { useDeleteUserAction } from "./userActions/useDeleteUserAction";
import { useLimitsUserAction } from "./userActions/useLimitsUserAction";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

export function useUserActions(users: AdminUserDto[] | undefined) {
  const { show, SnackbarAlert } = useAdminSnackbar();
  return {
    menu: useAdminUserMenu(users),
    ban: useBanUserAction(show),
    role: useRoleUserAction(show),
    remove: useDeleteUserAction(show),
    limits: useLimitsUserAction(show),
    SnackbarAlert,
  };
}
