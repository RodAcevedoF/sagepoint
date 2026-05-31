"use client";

import { Box } from "@mui/material";
import { aurora as auroraPalette } from "@/shared/theme";
import type { AuroraDifficulty } from "./tones";

export interface MixSegment {
  key: string;
  count: number;
  color?: string;
  label?: string;
}

interface MixBarProps {
  segments: MixSegment[];
}

export function MixBar({ segments }: MixBarProps) {
  const active = segments.filter((s) => s.count > 0);
  if (active.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      <Box
        sx={{
          display: "flex",
          height: "8px",
          borderRadius: "999px",
          overflow: "hidden",
          gap: "2px",
          background: "oklch(0.27 0.02 262 / 0.5)",
        }}
      >
        {active.map((s) => (
          <Box
            key={s.key}
            sx={{ height: "100%", borderRadius: "2px" }}
            style={{
              flex: s.count,
              background: s.color ?? auroraPalette.txMid,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "7px 14px" }}>
        {active.map((s) => (
          <Box
            component="span"
            key={s.key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12px",
              color: auroraPalette.txMid,
              fontWeight: 500,
              "& b": {
                fontFamily: auroraPalette.font.mono,
                color: auroraPalette.txHi,
                fontWeight: 600,
              },
            }}
          >
            <Box
              component="span"
              sx={{ width: "8px", height: "8px", borderRadius: "3px" }}
              style={{ background: s.color ?? auroraPalette.txMid }}
            />
            <b>{s.count}</b> {s.label ?? s.key}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Convenience: convert a `{ difficulty: count }` map into MixBar segments
 * coloured from the Aurora difficulty palette.
 */
export function difficultySegments(
  distribution: Partial<Record<AuroraDifficulty, number>>,
): MixSegment[] {
  return (
    [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ] as const satisfies readonly AuroraDifficulty[]
  )
    .map<MixSegment>((key) => ({
      key,
      count: distribution[key] ?? 0,
      color: auroraPalette.difficulty[key],
    }))
    .filter((s) => s.count > 0);
}
