"use client";

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
  Ban,
  UserCheck,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useAdminUsersQuery } from "@/application/admin";
import { adminTableStyles } from "../AdminRoadmaps/adminTable.styles";
import { StatusChip } from "../Cards/StatusChip";
import { UserActionsMenu } from "../Dialogs/UserActionsMenu";
import { UserLimitsDialog } from "../Dialogs/UserLimitsDialog";
import {
  HEADERS,
  activeColors,
  getAvatarSx,
  roleColors,
  usersTableStyles,
} from "./AdminUsersTable.styles";
import { formatRelativeDate } from "../../utils/adminFeat.utils";
import { useUserActions } from "../../hooks/useUserActions";

export function AdminUsersTable() {
  const { data: users, isLoading, isError } = useAdminUsersQuery();
  const {
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
    cancelDelete,
    cancelBan,
    cancelRole,
    cancelEditLimits,
    SnackbarAlert,
  } = useUserActions(users);

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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {user.role === "ADMIN" && (
                            <Shield size={12} color={palette.error.light} />
                          )}
                          <StatusChip label={user.role} colorMap={roleColors} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
        onBan={openBanDialog}
        onToggleRole={openRoleDialog}
        onEditLimits={openEditLimitsDialog}
        onDelete={openDeleteDialog}
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
        onCancel={cancelDelete}
      />

      <ConfirmDialog
        open={Boolean(userToToggleBan)}
        title={userToToggleBan?.isActive ? "Ban User" : "Unban User"}
        description={
          userToToggleBan?.isActive ? (
            <>
              This will prevent <strong>{userToToggleBan?.name}</strong> from
              accessing the platform.
            </>
          ) : (
            <>
              This will restore access for{" "}
              <strong>{userToToggleBan?.name}</strong>.
            </>
          )
        }
        confirmLabel={userToToggleBan?.isActive ? "Ban User" : "Unban User"}
        confirmIcon={userToToggleBan?.isActive ? Ban : UserCheck}
        variant={userToToggleBan?.isActive ? "danger" : "default"}
        onConfirm={handleBanConfirm}
        onCancel={cancelBan}
      />

      <ConfirmDialog
        open={Boolean(userToToggleRole)}
        title={
          userToToggleRole?.role === "ADMIN"
            ? "Revoke Admin Role"
            : "Grant Admin Role"
        }
        description={
          userToToggleRole?.role === "ADMIN" ? (
            <>
              This will remove admin privileges from{" "}
              <strong>{userToToggleRole?.name}</strong>.
            </>
          ) : (
            <>
              This will grant admin privileges to{" "}
              <strong>{userToToggleRole?.name}</strong>. They will gain full
              access to the admin panel.
            </>
          )
        }
        confirmLabel={
          userToToggleRole?.role === "ADMIN" ? "Revoke Admin" : "Make Admin"
        }
        confirmIcon={
          userToToggleRole?.role === "ADMIN" ? ShieldOff : ShieldCheck
        }
        variant={userToToggleRole?.role === "ADMIN" ? "danger" : "default"}
        onConfirm={handleRoleConfirm}
        onCancel={cancelRole}
      />

      <UserLimitsDialog
        open={Boolean(userToEditLimits)}
        user={userToEditLimits ?? undefined}
        initialBalance={selectedUserLimits?.balance}
        onClose={cancelEditLimits}
        onConfirm={handleLimitsConfirm}
      />

      {SnackbarAlert}
    </>
  );
}
