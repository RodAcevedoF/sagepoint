"use client";

import { useRef } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import {
  Ban,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Trash2,
  Settings2,
} from "lucide-react";
import { palette } from "@/shared/theme";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

interface UserActionsMenuProps {
  anchorEl: HTMLElement | null;
  user: AdminUserDto | undefined;
  onClose: () => void;
  onBan: () => void;
  onToggleRole: () => void;
  onEditLimits: () => void;
  onDelete: () => void;
}

export function UserActionsMenu({
  anchorEl,
  user,
  onClose,
  onBan,
  onToggleRole,
  onEditLimits,
  onDelete,
}: UserActionsMenuProps) {
  const lastUserRef = useRef<AdminUserDto | undefined>(user);
  if (user) lastUserRef.current = user;
  const displayUser = lastUserRef.current;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: palette.background.paper,
            border: `1px solid ${alpha(palette.divider, 0.1)}`,
          },
        },
      }}
    >
      <MenuItem onClick={onBan}>
        <ListItemIcon>
          {displayUser?.isActive ? (
            <Ban size={16} color={palette.error.main} />
          ) : (
            <UserCheck size={16} color={palette.success.main} />
          )}
        </ListItemIcon>
        <ListItemText>
          {displayUser?.isActive ? "Ban User" : "Unban User"}
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onToggleRole}>
        <ListItemIcon>
          {displayUser?.role === "ADMIN" ? (
            <ShieldOff size={16} color={palette.warning.main} />
          ) : (
            <ShieldCheck size={16} color={palette.info.main} />
          )}
        </ListItemIcon>
        <ListItemText>
          {displayUser?.role === "ADMIN" ? "Revoke Admin" : "Make Admin"}
        </ListItemText>
      </MenuItem>
      <MenuItem onClick={onEditLimits}>
        <ListItemIcon>
          <Settings2 size={16} color={palette.info.main} />
        </ListItemIcon>
        <ListItemText>Edit Limits</ListItemText>
      </MenuItem>
      <MenuItem onClick={onDelete} sx={{ color: palette.error.light }}>
        <ListItemIcon>
          <Trash2 size={16} color={palette.error.main} />
        </ListItemIcon>
        <ListItemText>Delete User</ListItemText>
      </MenuItem>
    </Menu>
  );
}
