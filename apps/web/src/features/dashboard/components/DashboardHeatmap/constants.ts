import { Flame, Trophy, Activity } from "lucide-react";
import { aurora } from "@/shared/theme";

export const DAYS = 365;
export const GAP = 4;
export const DAY_LABEL_W = 30;
export const MONTH_ROW_H = 22;
export const CELL_SIZE = 13;

export const OUT_OF_RANGE = "oklch(0.24 0.02 262 / 0.4)";

// Multi-hue ramp matching the dashboard mock: dim → ready → teal → concept → enrich → proc.
export const BUCKETS = [
  "oklch(0.24 0.02 262 / 0.7)",
  aurora.status.ready,
  aurora.teal,
  aurora.status.concept,
  aurora.status.enrich,
  aurora.status.proc,
] as const;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SHOW_DAY = new Set([1, 3, 5]);

export const STATS = [
  {
    key: "current",
    icon: Flame,
    label: "Day streak",
    color: aurora.status.proc,
  },
  {
    key: "longest",
    icon: Trophy,
    label: "Longest",
    color: aurora.status.enrich,
  },
  {
    key: "total30",
    icon: Activity,
    label: "Steps · 30d",
    color: aurora.teal,
  },
] as const;

export type StatKey = (typeof STATS)[number]["key"];
