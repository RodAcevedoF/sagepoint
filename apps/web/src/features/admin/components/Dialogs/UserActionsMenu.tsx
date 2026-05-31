"use client";

import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Ban,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Trash2,
  Settings2,
} from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { toneColor } from "@/shared/components";
import type { AdminUserDto } from "@/infrastructure/api/adminApi";

interface UserActionsMenuProps {
  anchorEl: HTMLElement | null;
  user: AdminUserDto | undefined;
  onClose: () => void;
  onMenuExited?: () => void;
  onBan: () => void;
  onToggleRole: () => void;
  onEditLimits: () => void;
  onDelete: () => void;
}

const paperSx = {
  background: aurora.surface,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.md,
  boxShadow: aurora.shadow.card,
  marginTop: "6px",
  fontFamily: aurora.font.ui,
  minWidth: "200px",
} as const;

const itemSx = {
  fontFamily: aurora.font.ui,
  fontSize: "14px",
  fontWeight: 500,
  color: aurora.tx,
  paddingY: "10px",
  "&:hover": {
    background: auroraTint(aurora.teal, 0.08),
    color: aurora.txHi,
  },
} as const;

const dangerItemSx = {
  ...itemSx,
  color: aurora.status.fail,
  "&:hover": {
    background: auroraTint(aurora.status.fail, 0.1),
    color: aurora.status.fail,
  },
} as const;

const listItemIconSx = {
  minWidth: "30px",
} as const;

export function UserActionsMenu({
  anchorEl,
  user,
  onClose,
  onMenuExited,
  onBan,
  onToggleRole,
  onEditLimits,
  onDelete,
}: UserActionsMenuProps) {
  const isActive = user?.isActive ?? true;
  const isAdmin = user?.role === "ADMIN";

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      disableScrollLock
      TransitionProps={{ onExited: onMenuExited }}
      slotProps={{ paper: { sx: paperSx } }}
    >
      <MenuItem onClick={onBan} sx={itemSx}>
        <ListItemIcon sx={listItemIconSx}>
          {isActive ? (
            <Ban size={16} color={aurora.status.fail} />
          ) : (
            <UserCheck size={16} color={aurora.status.ready} />
          )}
        </ListItemIcon>
        <ListItemText>{isActive ? "Ban User" : "Unban User"}</ListItemText>
      </MenuItem>
      <MenuItem onClick={onToggleRole} sx={itemSx}>
        <ListItemIcon sx={listItemIconSx}>
          {isAdmin ? (
            <ShieldOff size={16} color={aurora.status.proc} />
          ) : (
            <ShieldCheck size={16} color={aurora.status.concept} />
          )}
        </ListItemIcon>
        <ListItemText>{isAdmin ? "Revoke Admin" : "Make Admin"}</ListItemText>
      </MenuItem>
      <MenuItem onClick={onEditLimits} sx={itemSx}>
        <ListItemIcon sx={listItemIconSx}>
          <Settings2 size={16} color={toneColor("teal")} />
        </ListItemIcon>
        <ListItemText>Edit Limits</ListItemText>
      </MenuItem>
      <MenuItem onClick={onDelete} sx={dangerItemSx}>
        <ListItemIcon sx={listItemIconSx}>
          <Trash2 size={16} color={aurora.status.fail} />
        </ListItemIcon>
        <ListItemText>Delete User</ListItemText>
      </MenuItem>
    </Menu>
  );
}
