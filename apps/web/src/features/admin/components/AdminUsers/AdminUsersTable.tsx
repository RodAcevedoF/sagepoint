"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Avatar,
  Box,
  alpha,
  IconButton,
} from "@mui/material";
import { Card, ConfirmDialog, Loader, ErrorState } from "@/shared/components";
import { palette } from "@/shared/theme";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  useAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetUserLimitsQuery,
  useUpdateUserLimitsMutation,
} from "@/application/admin";
import { adminTableStyles } from "../AdminRoadmaps/adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { useAdminSnackbar } from "../../hooks/useAdminSnackbar";
import { UserActionsMenu } from "../Dialogs/UserActionsMenu";
import { UserLimitsDialog } from "../Dialogs/UserLimitsDialog";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";
import {
  HEADERS,
  activeColors,
  getAvatarSx,
  roleColors,
  usersTableStyles,
} from "./AdminUsersTable.styles";
import { formatRelativeDate } from "../../utils/adminFeat.utils";

export function AdminUsersTable() {
  const { data: users, isLoading, isError } = useAdminUsersQuery();
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

  const handleToggleBan = async () => {
    if (!selectedUser) return;
    const action = selectedUser.isActive ? "ban" : "unban";
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedUser.name}?`,
      )
    )
      return;
    const userId = selectedUser.id;
    const wasActive = selectedUser.isActive;
    handleMenuClose();
    try {
      await updateUser({ id: userId, data: { isActive: !wasActive } }).unwrap();
      show(`User ${wasActive ? "banned" : "unbanned"} successfully`, "success");
    } catch {
      show(`Failed to ${action} user`, "error");
    }
  };

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    const newRole = selectedUser.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Change ${selectedUser.name}'s role to ${newRole}?`))
      return;
    const userId = selectedUser.id;
    handleMenuClose();
    try {
      await updateUser({ id: userId, data: { role: newRole } }).unwrap();
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

  if (isLoading) return <Loader variant="page" message="Loading users" />;
  if (isError || !users)
    return (
      <ErrorState
        title="Failed to load users"
        description="Could not retrieve user data."
      />
    );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" sx={usersTableStyles.card}>
          <Card.Header>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <User size={20} color={palette.primary.main} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                User Directory
              </Typography>
              <Chip
                label={`${users.length} total`}
                size="small"
                sx={usersTableStyles.countChip}
              />
            </Box>
          </Card.Header>
          <Card.Content sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {HEADERS.map((h) => (
                      <TableCell key={h} sx={adminTableStyles.headerCell}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} sx={adminTableStyles.row}>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar sx={getAvatarSx(user.role)}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {user.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: palette.text.secondary }}
                            >
                              ID: {user.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Mail
                            size={14}
                            color={alpha(palette.text.secondary, 0.4)}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: palette.text.secondary }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {user.role === "ADMIN" && (
                            <Shield size={12} color={palette.error.light} />
                          )}
                          <StatusChip label={user.role} colorMap={roleColors} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <StatusChip
                            label={user.isActive ? "Active" : "Banned"}
                            colorMap={activeColors}
                          />
                          {user.isVerified && (
                            <CheckCircle2 size={14} color={palette.info.main} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Calendar
                            size={14}
                            color={alpha(palette.text.secondary, 0.4)}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: palette.text.secondary }}
                          >
                            {formatRelativeDate(user.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user.id)}
                        >
                          <MoreVertical size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card.Content>
        </Card>
      </motion.div>

      <UserActionsMenu
        anchorEl={anchorEl}
        user={selectedUser}
        onClose={handleMenuClose}
        onMenuExited={handleMenuExited}
        onBan={handleToggleBan}
        onToggleRole={handleToggleRole}
        onEditLimits={() => {
          if (selectedUser) setUserToEditLimits(selectedUser);
          setAnchorEl(null);
        }}
        onDelete={() => {
          if (selectedUser) setUserToDelete(selectedUser);
          setAnchorEl(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Delete User Permanently"
        description={
          <>
            This will permanently delete <strong>{userToDelete?.name}</strong> (
            {userToDelete?.email}) and all their associated data. This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Permanently"
        confirmIcon={Trash2}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />

      <UserLimitsDialog
        open={Boolean(userToEditLimits)}
        user={userToEditLimits ?? undefined}
        initialBalance={selectedUserLimits?.balance}
        onClose={() => setUserToEditLimits(null)}
        onConfirm={handleLimitsConfirm}
      />

      {SnackbarAlert}
    </>
  );
}
