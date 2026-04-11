import { type Theme } from "@mui/material";

export function getUsageColor(pct: number, theme: Theme) {
  if (pct >= 100) return theme.palette.error.main;
  if (pct >= 75) return theme.palette.warning.main;
  return theme.palette.primary.main;
}

export function getRemainingLabel(remaining: number, max: number) {
  const pct = (remaining / max) * 100;
  if (remaining === 0) return { text: "None left", color: "error.main" };
  if (pct <= 25) return { text: `${remaining} left`, color: "warning.main" };
  return { text: `${remaining} left`, color: "success.main" };
}
