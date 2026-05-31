"use client";

import { Box, keyframes } from "@mui/material";
import { aurora as auroraPalette } from "@/shared/theme";
import { resolveAccent, type AuroraTone } from "./tones";

interface PipelineProps {
  stages: readonly string[];
  currentIndex: number;
  eta?: string;
  tone?: AuroraTone;
  accent?: string;
}

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  50% { opacity: 0.35; }
`;

export function Pipeline({
  stages,
  currentIndex,
  eta,
  tone = "proc",
  accent,
}: PipelineProps) {
  const color = resolveAccent(tone, accent);
  const segmentCount = stages.length;
  const safeIndex = Math.max(0, Math.min(stages.length - 1, currentIndex));
  const currentLabel = stages[safeIndex] ?? "";

  return (
    <Box
      sx={{ padding: "16px 22px 4px", position: "relative", zIndex: 1 }}
      style={{ ["--accent" as string]: color }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "11px",
        }}
      >
        <Box
          component="span"
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          style={{ color }}
        >
          <Box
            component="span"
            sx={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              boxShadow: `0 0 0 3px color-mix(in oklch, ${color} 22%, transparent)`,
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
            style={{ background: color }}
          />
          {currentLabel}…
        </Box>
        {eta && (
          <Box
            component="span"
            sx={{
              fontFamily: auroraPalette.font.mono,
              fontSize: "11px",
              color: auroraPalette.txLow,
            }}
          >
            {eta}
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: "5px" }}>
        {Array.from({ length: segmentCount }, (_, i) => {
          const isActive = i === safeIndex;
          return (
            <Box
              key={i}
              component="span"
              sx={{
                flex: 1,
                height: "5px",
                borderRadius: "999px",
                background: "oklch(0.30 0.02 262 / 0.6)",
                overflow: "hidden",
                position: "relative",
                ...(isActive && {
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    animation: `${shimmer} 1.3s ease-in-out infinite`,
                  },
                }),
              }}
              style={i <= safeIndex ? { background: color } : undefined}
            />
          );
        })}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "9px",
        }}
      >
        {stages.map((label, i) => {
          const isOn = i === safeIndex;
          const wasOn = i < safeIndex;
          return (
            <Box
              component="span"
              key={label}
              sx={{
                fontSize: "10.5px",
                fontFamily: auroraPalette.font.mono,
                letterSpacing: "0.04em",
                color: isOn
                  ? color
                  : wasOn
                    ? auroraPalette.txMid
                    : auroraPalette.txLow,
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
