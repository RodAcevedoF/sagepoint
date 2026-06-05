"use client";

import { useState } from "react";
import {
  useGetUserLimitsQuery,
  useUpdateUserLimitsCommand,
} from "@/application/admin";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";
import type { ShowSnackbar } from "../useAdminSnackbar";

interface LimitsState {
  open: boolean;
  user: AdminUserDto | null;
}

export interface LimitsConfirmData {
  balance?: number | null;
  credit?: number;
}

export function useLimitsUserAction(show: ShowSnackbar) {
  const updateLimits = useUpdateUserLimitsCommand();
  const [state, setState] = useState<LimitsState>({ open: false, user: null });

  const { data: limits } = useGetUserLimitsQuery(state.user?.id ?? "", {
    skip: !state.user,
  });

  const close = () => setState((s) => ({ ...s, open: false }));

  const confirm = async (data: LimitsConfirmData) => {
    if (!state.user) return;
    const { user } = state;
    close();
    const result = await updateLimits.execute({ id: user.id, data });
    show(
      result.ok ? "Token balance updated" : "Failed to update token balance",
      result.ok ? "success" : "error",
    );
  };

  return {
    open: state.open,
    user: state.user,
    currentBalance: limits?.balance,
    openFor: (user: AdminUserDto) => setState({ open: true, user }),
    cancel: close,
    confirm,
  };
}
