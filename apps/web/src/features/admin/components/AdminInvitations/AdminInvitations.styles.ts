import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";

export const styles = {
  headerCell: {
    color: palette.text.secondary,
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    py: 2,
    borderBottom: `1px solid rgba(255,255,255,0.06)`,
  },
  row: {
    "&:hover": { bgcolor: "rgba(255,255,255,0.025)" },
    transition: "background-color 0.15s ease",
    "& td": { borderBottom: `1px solid rgba(255,255,255,0.04)` },
  },
};

export const tabSx = {
  textTransform: "none" as const,
  fontWeight: 600,
  fontSize: "0.875rem",
  p: "12px 16px",
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
  },
};

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
  fontSize: "0.75rem",
  fontWeight: 700,
  bgcolor: "rgba(255,255,255,0.06)",
  color: palette.text.secondary,
  border: "none",
};

export function getRoleChipSx(role: string) {
  return {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderRadius: "6px",
    bgcolor:
      role === "ADMIN"
        ? alpha(palette.error.main, 0.12)
        : alpha(palette.text.secondary, 0.08),
    color: role === "ADMIN" ? palette.error.light : palette.text.secondary,
    border: "none",
  };
}

export function getStatusChipSx(statusStyle: { bg: string; text: string }) {
  return {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderRadius: "6px",
    bgcolor: statusStyle.bg,
    color: statusStyle.text,
    border: "none",
  };
}

export const menuPaperSx = {
  bgcolor: palette.background.paper,
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 2,
};
