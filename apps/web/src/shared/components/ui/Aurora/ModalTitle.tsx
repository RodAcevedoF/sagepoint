"use client";

import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { resolveAccent, type AuroraTone } from "./tones";

interface ModalTitleProps {
  /** Small uppercase mono caps above the title (e.g. "Quiz", "Step 4"). */
  eyebrow: ReactNode;
  /** Main display title — rendered with the aurora gradient. */
  title: ReactNode;
  /** Leading icon rendered inside a tinted disc. */
  icon: ReactNode;
  /** Semantic tone for the icon tint + gradient end-stop. Defaults to teal. */
  tone?: AuroraTone;
}

/**
 * Aurora modal header. Pair with `showCloseButton: true` and omit the
 * generic Modal `title`; this primitive replaces the bland string-only
 * `DialogTitle` with a kicker + gradient title + icon disc that matches
 * the rest of the design.
 */
export function ModalTitle({
  eyebrow,
  title,
  icon,
  tone = "teal",
}: ModalTitleProps) {
  const accent = resolveAccent(tone, undefined);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <Box
        component="span"
        sx={{
          flex: "none",
          width: 44,
          height: 44,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          background: `color-mix(in oklch, ${accent} 18%, ${auroraPalette.surface2})`,
          border: `1px solid ${auroraTint(accent, 0.28)}`,
          color: accent,
          boxShadow: `0 0 22px -6px ${auroraTint(accent, 0.6)}`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            fontFamily: auroraPalette.font.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: auroraPalette.txLow,
          }}
        >
          {eyebrow}
        </Box>
        <Box
          component="h2"
          sx={{
            margin: "3px 0 0",
            fontFamily: auroraPalette.font.display,
            fontWeight: 800,
            fontSize: { xs: "20px", sm: "23px" },
            lineHeight: 1.15,
            letterSpacing: "-0.018em",
            background: `linear-gradient(120deg, ${auroraPalette.txHi} 28%, ${accent} 96%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            wordBreak: "break-word",
          }}
        >
          {title}
        </Box>
      </Box>
    </Box>
  );
}
