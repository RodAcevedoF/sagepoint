"use client";

import { Box, keyframes } from "@mui/material";
import type { ReactNode } from "react";
import { resolveAccent, type AuroraTone } from "./tones";
import { aurora as auroraPalette } from "@/shared/theme";

interface StatusPillProps {
  label: ReactNode;
  tone?: AuroraTone;
  accent?: string;
  pulse?: boolean;
}

const pulseKeyframes = keyframes`
  50% { opacity: 0.35; }
`;

export function StatusPill({ label, tone, accent, pulse }: StatusPillProps) {
  const color = resolveAccent(tone, accent);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "5px 12px 5px 10px",
        borderRadius: auroraPalette.radii.pill,
        fontSize: "12.5px",
        fontWeight: 600,
        background: "color-mix(in oklch, var(--accent) 13%, transparent)",
        color: "var(--accent)",
        border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
      }}
      style={{ ["--accent" as string]: color }}
    >
      <Box
        component="span"
        sx={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow:
            "0 0 0 3px color-mix(in oklch, var(--accent) 22%, transparent)",
          animation: pulse
            ? `${pulseKeyframes} 1.5s ease-in-out infinite`
            : undefined,
        }}
      />
      {label}
    </Box>
  );
}
