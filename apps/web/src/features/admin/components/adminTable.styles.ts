import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";

export const adminTableStyles = {
  headerCell: {
    color: palette.text.secondary,
    fontWeight: 700,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    py: 2,
    borderBottom: `1px solid ${alpha(palette.divider, 0.1)}`,
  },
  row: {
    "&:hover": {
      bgcolor: alpha(palette.primary.main, 0.04),
    },
    transition: "background-color 0.2s ease",
  },
  filterBar: {
    display: "flex",
    gap: 2,
    mb: 2,
    flexWrap: "wrap",
    alignItems: "center",
  },
} as const;

export const statusColors: Record<string, string> = {
  PENDING: palette.warning.main,
  PROCESSING: palette.info.main,
  COMPLETED: palette.success.main,
  FAILED: palette.error.main,
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
