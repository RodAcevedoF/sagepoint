"use client";

import { useState } from "react";
import {
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetUserLimitsQuery,
  useUpdateUserLimitsMutation,
} from "@/application/admin";
import { useAdminSnackbar } from "./useAdminSnackbar";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

export function useUserActions(users: AdminUserDto[] | undefined) {
  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();
  const [updateLimits] = useUpdateUserLimitsMutation();
  const { show, SnackbarAlert } = useAdminSnackbar();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUserDto | null>(null);
  const [userToEditLimits, setUserToEditLimits] = useState<AdminUserDto | null>(
    null,
  );
  const [userToToggleBan, setUserToToggleBan] = useState<AdminUserDto | null>(
    null,
  );
  const [userToToggleRole, setUserToToggleRole] = useState<AdminUserDto | null>(
    null,
  );

  const { data: selectedUserLimits } = useGetUserLimitsQuery(
    userToEditLimits?.id ?? "",
    { skip: !userToEditLimits },
  );

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuExited = () => setSelectedUserId(null);

  const openBanDialog = () => {
    if (selectedUser) setUserToToggleBan(selectedUser);
    setAnchorEl(null);
  };

  const openRoleDialog = () => {
    if (selectedUser) setUserToToggleRole(selectedUser);
    setAnchorEl(null);
  };

  const openEditLimitsDialog = () => {
    if (selectedUser) setUserToEditLimits(selectedUser);
    setAnchorEl(null);
  };

  const openDeleteDialog = () => {
    if (selectedUser) setUserToDelete(selectedUser);
    setAnchorEl(null);
  };

  const handleBanConfirm = async () => {
    const target = userToToggleBan;
    if (!target) return;
    const wasActive = target.isActive;
    setUserToToggleBan(null);
    try {
      await updateUser({
        id: target.id,
        data: { isActive: !wasActive },
      }).unwrap();
      show(`User ${wasActive ? "banned" : "unbanned"} successfully`, "success");
    } catch {
      show(`Failed to ${wasActive ? "ban" : "unban"} user`, "error");
    }
  };

  const handleRoleConfirm = async () => {
    const target = userToToggleRole;
    if (!target) return;
    const newRole = target.role === "ADMIN" ? "USER" : "ADMIN";
    setUserToToggleRole(null);
    try {
      await updateUser({ id: target.id, data: { role: newRole } }).unwrap();
      show(`Role changed to ${newRole} successfully`, "success");
    } catch {
      show("Failed to change role", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    const target = userToDelete;
    if (!target) return;
    setUserToDelete(null);
    try {
      await deleteUser(target.id).unwrap();
      show("User deleted permanently", "success");
    } catch {
      show("Failed to delete user", "error");
    }
  };

  const handleLimitsConfirm = async (data: {
    balance?: number | null;
    credit?: number;
  }) => {
    const target = userToEditLimits;
    if (!target) return;
    setUserToEditLimits(null);
    try {
      await updateLimits({ id: target.id, data }).unwrap();
      show("Token balance updated", "success");
    } catch {
      show("Failed to update token balance", "error");
    }
  };

  return {
    anchorEl,
    selectedUser,
    handleMenuOpen,
    handleMenuClose,
    handleMenuExited,
    openBanDialog,
    openRoleDialog,
    openEditLimitsDialog,
    openDeleteDialog,
    userToDelete,
    userToToggleBan,
    userToToggleRole,
    userToEditLimits,
    selectedUserLimits,
    handleBanConfirm,
    handleRoleConfirm,
    handleDeleteConfirm,
    handleLimitsConfirm,
    cancelDelete: () => setUserToDelete(null),
    cancelBan: () => setUserToToggleBan(null),
    cancelRole: () => setUserToToggleRole(null),
    cancelEditLimits: () => setUserToEditLimits(null),
    SnackbarAlert,
  };
}
