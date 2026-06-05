"use client";

import { useState } from "react";
import { useUpdateAdminUserCommand } from "@/application/admin";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";
import type { ShowSnackbar } from "../useAdminSnackbar";

interface RoleState {
  open: boolean;
  user: AdminUserDto | null;
  willRevoke: boolean;
}

/**
 * `willRevoke` is snapshotted at openFor time — same close-animation freeze
 * pattern as `useBanUserAction`.
 */
export function useRoleUserAction(show: ShowSnackbar) {
  const updateUser = useUpdateAdminUserCommand();
  const [state, setState] = useState<RoleState>({
    open: false,
    user: null,
    willRevoke: false,
  });

  const close = () => setState((s) => ({ ...s, open: false }));

  const confirm = async () => {
    if (!state.user) return;
    const { user, willRevoke } = state;
    const newRole = willRevoke ? "USER" : "ADMIN";
    close();
    const result = await updateUser.execute({
      id: user.id,
      data: { role: newRole },
    });
    show(
      result.ok
        ? `Role changed to ${newRole} successfully`
        : "Failed to change role",
      result.ok ? "success" : "error",
    );
  };

  return {
    open: state.open,
    user: state.user,
    willRevoke: state.willRevoke,
    openFor: (user: AdminUserDto) =>
      setState({ open: true, user, willRevoke: user.role === "ADMIN" }),
    cancel: close,
    confirm,
  };
}
