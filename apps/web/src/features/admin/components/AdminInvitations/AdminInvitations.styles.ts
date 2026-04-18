import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";

export const styles = {
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
    "&:hover": { bgcolor: alpha(palette.primary.main, 0.04) },
    transition: "background-color 0.2s ease",
  },
};

export const tabSx = { textTransform: "none" as const, fontWeight: 600 };

export const inviteLinkBoxSx = {
  mt: 2,
  p: 2,
  borderRadius: 2,
  bgcolor: alpha(palette.success.main, 0.08),
  border: `1px solid ${alpha(palette.success.main, 0.2)}`,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const inviteLinkTextSx = {
  flex: 1,
  wordBreak: "break-all" as const,
  color: palette.success.light,
  fontFamily: "monospace",
  fontSize: "0.8rem",
};

export const countChipSx = {
  ml: 1,
  height: 20,
  fontSize: "0.85rem",
  fontWeight: 700,
  bgcolor: alpha(palette.info.main, 0.1),
  color: palette.info.light,
  border: "none",
};

export function getRoleChipSx(role: string) {
  return {
    fontWeight: 700,
    fontSize: "0.8rem",
    borderRadius: "6px",
    bgcolor:
      role === "ADMIN"
        ? alpha(palette.error.main, 0.1)
        : alpha(palette.text.secondary, 0.1),
    color: role === "ADMIN" ? palette.error.light : palette.text.secondary,
    border: "none",
  };
}

export function getStatusChipSx(statusStyle: { bg: string; text: string }) {
  return {
    fontWeight: 700,
    fontSize: "0.8rem",
    borderRadius: "6px",
    bgcolor: statusStyle.bg,
    color: statusStyle.text,
    border: "none",
  };
}

export const menuPaperSx = {
  bgcolor: palette.background.paper,
  border: `1px solid ${alpha(palette.divider, 0.1)}`,
};
