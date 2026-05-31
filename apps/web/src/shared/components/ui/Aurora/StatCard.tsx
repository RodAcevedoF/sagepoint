"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";
import { aurora as auroraPalette } from "@/shared/theme";
import { resolveAccent, type AuroraTone } from "./tones";

interface StatCardProps {
  icon?: ReactNode;
  value: ReactNode;
  label: ReactNode;
  tone?: AuroraTone;
  accent?: string;
  style?: CSSProperties;
}

export function StatCard({
  icon,
  value,
  label,
  tone,
  accent,
  style,
}: StatCardProps) {
  const color = resolveAccent(tone, accent);
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: auroraPalette.radii.card,
        border: `1px solid ${auroraPalette.line}`,
        background:
          "linear-gradient(165deg, oklch(0.235 0.026 262 / 0.85), oklch(0.185 0.026 262 / 0.7))",
        padding: "22px 22px 20px",
        boxShadow: auroraPalette.shadow.card,
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "0 0 auto 0",
          height: "2px",
          background: "var(--accent)",
          opacity: 0.5,
        },
        "@media (max-width: 480px)": {
          padding: "16px 14px 14px",
          borderRadius: "16px",
        },
      }}
      style={{ ["--accent" as string]: color, ...style }}
    >
      {icon && (
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: auroraPalette.radii.md,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in oklch, var(--accent) 15%, transparent)",
            color: "var(--accent)",
            border:
              "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
            "@media (max-width: 480px)": { width: 34, height: 34 },
          }}
        >
          {icon}
        </Box>
      )}
      <Box
        sx={{
          fontFamily: auroraPalette.font.display,
          fontWeight: 800,
          fontSize: "42px",
          lineHeight: 1,
          marginTop: "16px",
          color: "var(--accent)",
          letterSpacing: "-0.02em",
          "@media (max-width: 480px)": { fontSize: "30px", marginTop: "10px" },
        }}
      >
        {value}
      </Box>
      <Box
        sx={{
          marginTop: "7px",
          fontSize: "13.5px",
          color: auroraPalette.txMid,
          fontWeight: 500,
          "@media (max-width: 480px)": { fontSize: "12px", marginTop: "4px" },
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

interface StatGridProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function StatGrid({ children, style }: StatGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
        "@media (max-width: 900px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        },
      }}
      style={style}
    >
      {children}
    </Box>
  );
}
