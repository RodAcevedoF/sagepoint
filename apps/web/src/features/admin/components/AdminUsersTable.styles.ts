import { alpha } from "@mui/material";
import { palette } from "@/common/theme";

export const HEADERS = [
  "Identity",
  "Auth Detail",
  "Permission",
  "Status",
  "Registration",
  "Actions",
];

export const roleColors: Record<string, string> = {
  ADMIN: palette.error.light,
  USER: palette.text.secondary,
};

export const activeColors: Record<string, string> = {
  Active: palette.success.light,
  Banned: palette.error.light,
};

export function getAvatarSx(role: string) {
  const isAdmin = role === "ADMIN";
  const baseColor = isAdmin ? palette.error.main : palette.primary.main;
  return {
    width: 36,
    height: 36,
    fontSize: "0.875rem",
    fontWeight: 700,
    bgcolor: alpha(baseColor, 0.2),
    color: isAdmin ? palette.error.light : palette.primary.light,
    border: `1px solid ${alpha(baseColor, 0.2)}`,
  };
}

export const usersTableStyles = {
  card: {
    borderTop: `1px solid ${alpha(palette.primary.main, 0.2)}`,
  },
  countChip: {
    ml: 1,
    height: 20,
    fontSize: "0.85rem",
    fontWeight: 700,
    bgcolor: alpha(palette.success.main, 0.1),
    color: palette.success.light,
    border: "none",
  },
} as const;
