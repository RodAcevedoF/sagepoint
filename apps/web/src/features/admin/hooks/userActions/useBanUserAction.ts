"use client";

import { useState } from "react";
import { useUpdateAdminUserCommand } from "@/application/admin";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";
import type { ShowSnackbar } from "../useAdminSnackbar";

interface BanState {
  open: boolean;
  user: AdminUserDto | null;
  willBan: boolean;
}

/**
 * `willBan` is snapshotted from `user.isActive` at openFor time and never
 * re-derived from the live user. This keeps the dialog's title/label/icon
 * stable across the close animation — clearing only `open` (not user/willBan)
 * leaves the rendered text intact while MUI's Dialog transitions out.
 */
export function useBanUserAction(show: ShowSnackbar) {
  const updateUser = useUpdateAdminUserCommand();
  const [state, setState] = useState<BanState>({
    open: false,
    user: null,
    willBan: false,
  });

  const close = () => setState((s) => ({ ...s, open: false }));

  const confirm = async () => {
    if (!state.user) return;
    const { user, willBan } = state;
    close();
    const result = await updateUser.execute({
      id: user.id,
      data: { isActive: !willBan },
    });
    show(
      result.ok
        ? `User ${willBan ? "banned" : "unbanned"} successfully`
        : `Failed to ${willBan ? "ban" : "unban"} user`,
      result.ok ? "success" : "error",
    );
  };

  return {
    open: state.open,
    user: state.user,
    willBan: state.willBan,
    openFor: (user: AdminUserDto) =>
      setState({ open: true, user, willBan: user.isActive }),
    cancel: close,
    confirm,
  };
}
