"use client";

import { Box, IconButton } from "@mui/material";
import {
  Card,
  ConfirmDialog,
  ErrorState,
  Loader,
  Pill,
  StatusPill,
} from "@/shared/components";
import { aurora } from "@/shared/theme";
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
import { UserActionsMenu } from "../Dialogs/UserActionsMenu";
import { UserLimitsDialog } from "../Dialogs/UserLimitsDialog";
import {
  HEADERS,
  activeColors,
  avatarColorFor,
  getAvatarSx,
  roleColors,
} from "./AdminUsersTable.styles";
import { formatRelativeDate } from "../../utils/adminFeat.utils";
import { useUserActions } from "../../hooks/useUserActions";

const idMonoSx = {
  fontFamily: aurora.font.mono,
  fontSize: "12px",
  color: aurora.txLow,
  marginTop: "3px",
} as const;

const identityNameSx = {
  fontWeight: 700,
  fontSize: "15px",
  color: aurora.txHi,
} as const;

const cellInlineSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  color: aurora.tx,
  "& svg": { color: aurora.txLow },
} as const;

const dateInlineSx = {
  ...cellInlineSx,
  fontFamily: aurora.font.mono,
  fontSize: "13px",
  color: aurora.txMid,
  whiteSpace: "nowrap",
} as const;

const iconButtonSx = {
  width: 36,
  height: 36,
  borderRadius: aurora.radii.md,
  color: aurora.txMid,
  border: `1px solid ${aurora.line}`,
  background: aurora.surface2,
  "&:hover": {
    background: aurora.surface3,
    color: aurora.txHi,
    borderColor: aurora.line2,
  },
} as const;

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
      <Card variant="aurora" hoverable={false} withAura={false}>
        <Box sx={adminTableStyles.panelHead}>
          <Box sx={adminTableStyles.panelTitle}>
            <Box sx={adminTableStyles.panelTitleIcon}>
              <User size={20} />
            </Box>
            <Box component="h2" sx={adminTableStyles.panelHeading}>
              User Directory
            </Box>
            <Pill tone="ready">{users.length} total</Pill>
          </Box>
        </Box>
        <Box sx={adminTableStyles.tableScroll}>
          <Box component="table" sx={adminTableStyles.table}>
            <Box component="thead">
              <Box component="tr">
                {HEADERS.map((h) => (
                  <Box component="th" key={h} sx={adminTableStyles.headerCell}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {users.map((user) => {
                const avatarColor = avatarColorFor(user.role, user.id);
                const statusLabel = user.isActive ? "Active" : "Banned";
                const statusTone = user.isActive ? "ready" : "fail";
                return (
                  <Box component="tr" key={user.id} sx={adminTableStyles.row}>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <Box sx={getAvatarSx(avatarColor)}>
                          {user.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Box sx={identityNameSx}>{user.name}</Box>
                          <Box sx={idMonoSx}>ID: {user.id.slice(0, 8)}…</Box>
                        </Box>
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box component="span" sx={cellInlineSx}>
                        <Mail size={16} />
                        {user.email}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Pill
                        accent={roleColors[user.role] ?? aurora.txMid}
                        icon={
                          user.role === "ADMIN" ? (
                            <Shield size={12} />
                          ) : undefined
                        }
                      >
                        {user.role.toUpperCase()}
                      </Pill>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <StatusPill label={statusLabel} tone={statusTone} />
                        {user.isVerified && (
                          <CheckCircle2
                            size={14}
                            color={activeColors[statusLabel] ?? aurora.txMid}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <Box component="span" sx={dateInlineSx}>
                        <Calendar size={14} />
                        {formatRelativeDate(user.createdAt)}
                      </Box>
                    </Box>
                    <Box component="td" sx={adminTableStyles.bodyCell}>
                      <IconButton
                        sx={iconButtonSx}
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user.id)}
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Card>

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
