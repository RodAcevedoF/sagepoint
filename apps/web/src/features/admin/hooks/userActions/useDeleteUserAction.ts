"use client";

import { useState } from "react";
import { useDeleteAdminUserCommand } from "@/application/admin";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";
import type { ShowSnackbar } from "../useAdminSnackbar";

interface DeleteState {
  open: boolean;
  user: AdminUserDto | null;
}

export function useDeleteUserAction(show: ShowSnackbar) {
  const deleteUser = useDeleteAdminUserCommand();
  const [state, setState] = useState<DeleteState>({ open: false, user: null });

  const close = () => setState((s) => ({ ...s, open: false }));

  const confirm = async () => {
    if (!state.user) return;
    const { user } = state;
    close();
    const result = await deleteUser.execute(user.id);
    show(
      result.ok ? "User deleted permanently" : "Failed to delete user",
      result.ok ? "success" : "error",
    );
  };

  return {
    open: state.open,
    user: state.user,
    openFor: (user: AdminUserDto) => setState({ open: true, user }),
    cancel: close,
    confirm,
  };
}
