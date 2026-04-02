import { alpha, type Theme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import type { BlueprintNodeStatus } from "../BlueprintGraph.types";

export function getStatusColor(
  theme: Theme,
  status: BlueprintNodeStatus,
): string {
  switch (status) {
    case "completed":
      return theme.palette.success.light;
    case "active":
      return theme.palette.warning.light;
    case "skipped":
      return alpha(theme.palette.text.secondary, 0.5);
    default:
      return theme.palette.accent;
  }
}

export function getDifficultyColor(theme: Theme, difficulty?: string): string {
  const d = theme.palette.difficulty;
  switch (difficulty) {
    case "beginner":
      return d.beginner;
    case "intermediate":
      return d.intermediate;
    case "advanced":
      return d.advanced;
    case "expert":
      return d.expert;
    default:
      return d.unknown;
  }
}

export interface BlueprintNodeStyles {
  card: CSSProperties;
  label: CSSProperties;
  description: CSSProperties;
  badge: CSSProperties;
  handle: CSSProperties;
}

export const makeStyles = (
  theme: Theme,
  status: BlueprintNodeStatus,
): BlueprintNodeStyles => {
  const color = getStatusColor(theme, status);

  return {
    card: {
      background: alpha("#0a1628", 0.95),
      border: `1.5px solid ${alpha(color, 0.5)}`,
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 180,
      maxWidth: 240,
      boxShadow: `0 0 16px ${alpha(color, 0.25)}`,
      transition: "box-shadow 0.2s, border-color 0.2s",
      cursor: "pointer",
    },
    label: {
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      fontWeight: 600,
      color,
      margin: 0,
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    description: {
      fontFamily: '"Inter", sans-serif',
      fontSize: 11,
      color: alpha(theme.palette.text.secondary, 0.7),
      margin: "4px 0 0",
      lineHeight: 1.3,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    badge: {
      display: "inline-block",
      fontSize: 9,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "2px 6px",
      borderRadius: 4,
      marginTop: 6,
    },
    handle: {
      width: 8,
      height: 8,
      background: alpha(color, 0.6),
      border: `1.5px solid ${alpha(color, 0.8)}`,
      borderRadius: "50%",
    },
  };
};
