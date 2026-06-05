"use client";

import { useState, type MouseEvent } from "react";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

export function useAdminUserMenu(users: AdminUserDto[] | undefined) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return {
    anchorEl,
    user: users?.find((u) => u.id === selectedUserId),
    openFor: (event: MouseEvent<HTMLElement>, userId: string) => {
      setAnchorEl(event.currentTarget);
      setSelectedUserId(userId);
    },
    close: () => setAnchorEl(null),
    onExited: () => setSelectedUserId(null),
  };
}
