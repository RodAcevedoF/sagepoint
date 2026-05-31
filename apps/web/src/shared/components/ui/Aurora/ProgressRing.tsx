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
  caption?: string;
}

export function ProgressRing({
  value,
  size = 50,
  stroke = 4,
  tone,
  accent,
  caption,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, value));
  const offset = c - (c * safe) / 100;
  const color =
    accent ?? (tone ? resolveAccent(tone, undefined) : "var(--accent)");
  const pctFontSize = Math.max(13, Math.round(size * 0.25));

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
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            fontFamily: auroraPalette.font.display,
            fontWeight: 800,
            fontSize: `${pctFontSize}px`,
            color: "var(--accent)",
          }}
        >
          {Math.round(safe)}%
        </Box>
        {caption && (
          <Box
            component="span"
            sx={{
              marginTop: "3px",
              fontSize: "10px",
              color: auroraPalette.txLow,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {caption}
          </Box>
        )}
      </Box>
    </Box>
  );
}
