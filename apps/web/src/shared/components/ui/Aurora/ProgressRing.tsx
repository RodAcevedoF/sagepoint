"use client";

import { Box } from "@mui/material";
import { aurora as auroraPalette } from "@/shared/theme";
import { resolveAccent, type AuroraTone } from "./tones";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  tone?: AuroraTone;
  accent?: string;
}

export function ProgressRing({
  value,
  size = 50,
  stroke = 4,
  tone,
  accent,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, value));
  const offset = c - (c * safe) / 100;
  const color =
    accent ?? (tone ? resolveAccent(tone, undefined) : "var(--accent)");

  return (
    <Box
      sx={{
        flex: "none",
        position: "relative",
        display: "grid",
        placeItems: "center",
      }}
      style={{
        width: size,
        height: size,
        ["--accent" as string]: color,
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.30 0.02 262 / 0.7)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        component="span"
        sx={{
          position: "absolute",
          fontFamily: auroraPalette.font.mono,
          fontWeight: 700,
          fontSize: "13px",
          color: "var(--accent)",
        }}
      >
        {Math.round(safe)}%
      </Box>
    </Box>
  );
}
