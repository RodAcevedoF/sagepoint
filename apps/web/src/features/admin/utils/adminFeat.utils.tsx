import { palette } from "@/shared/theme";
import { alpha } from "@mui/material";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isExpired(expiresAt: string, status: string): boolean {
  return status === "PENDING" && new Date(expiresAt) < new Date();
}

export function buildInviteLink(token: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/register?invitation=${token}`;
}

export const statusColors: Record<string, string> = {
  PENDING: palette.warning.main,
  PROCESSING: palette.info.main,
  COMPLETED: palette.success.main,
  FAILED: palette.error.main,
};

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

export const invitationStatusColors: Record<
  string,
  { bg: string; text: string }
> = {
  PENDING: {
    bg: alpha(palette.warning.main, 0.1),
    text: palette.warning.light,
  },
  ACCEPTED: {
    bg: alpha(palette.success.main, 0.1),
    text: palette.success.light,
  },
  REVOKED: { bg: alpha(palette.error.main, 0.1), text: palette.error.light },
};
