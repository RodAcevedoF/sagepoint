import { alpha } from "@mui/material";
import { Flame, Trophy, Activity } from "lucide-react";
import { palette } from "@/shared/theme";

export const DAYS = 365;
export const GAP = 3;
export const DAY_LABEL_W_MOBILE = 26;
export const DAY_LABEL_W_DESKTOP = 38;
export const MONTH_ROW_H = 22;
export const MOBILE_CELL_W = 12;

export const OUT_OF_RANGE = alpha(palette.text.secondary, 0.04);

// Multi-hue ramp: dim → green → teal → blue → purple → amber.
export const BUCKETS = [
  alpha(palette.primary.main, 0.08),
  palette.success.main,
  palette.primary.main,
  palette.info.main,
  palette.purple.main,
  palette.warning.light,
] as const;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SHOW_DAY = new Set([1, 3, 5]);

export const STATS = [
  {
    key: "current",
    icon: Flame,
    label: "day streak",
    color: palette.warning.light,
  },
  {
    key: "longest",
    icon: Trophy,
    label: "longest",
    color: palette.purple.light,
  },
  {
    key: "total30",
    icon: Activity,
    label: "steps · 30d",
    color: palette.primary.light,
  },
] as const;

export type StatKey = (typeof STATS)[number]["key"];
