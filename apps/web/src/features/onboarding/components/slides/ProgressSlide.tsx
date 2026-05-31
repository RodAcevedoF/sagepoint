"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { SlideShell, SlideVisualFrame } from "./SlideShell";

type ProgressTint = "primary" | "success" | "accent" | "secondary";

interface Step {
  label: string;
  done: boolean;
  active?: boolean;
  tint: ProgressTint;
}

const STEPS: Step[] = [
  { label: "Variables & types", done: true, tint: "primary" },
  { label: "Functions & scope", done: true, tint: "success" },
  { label: "Promises", done: false, active: true, tint: "accent" },
  { label: "Async / await", done: false, tint: "secondary" },
];

const TINTS: Record<ProgressTint, string> = {
  primary: aurora.teal,
  success: aurora.status.ready,
  accent: aurora.status.enrich,
  secondary: aurora.status.concept,
};

function ProgressVisual() {
  const accent = aurora.status.enrich;
  const completedCount = STEPS.filter((step) => step.done).length;

  return (
    <SlideVisualFrame label="PATH STATUS" accent={accent}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 332,
          display: "grid",
          gap: 2.5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "end",
            gap: 1.5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: aurora.font.display,
              fontSize: "2.3rem",
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              fontWeight: 700,
              color: aurora.txHi,
            }}
          >
            0{completedCount}
          </Typography>
          <Box sx={{ display: "grid", gap: 0.75 }}>
            <Typography
              variant="caption"
              sx={{
                color: aurora.txMid,
                fontFamily: aurora.font.mono,
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            >
              CURRENT RUN
            </Typography>
            <Box
              sx={{
                height: 8,
                borderRadius: 999,
                background: auroraTint(accent, 0.12),
                overflow: "hidden",
              }}
            >
              <Box
                component={motion.div}
                initial={{ width: "0%" }}
                animate={{ width: "50%" }}
                transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
                sx={{
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${aurora.teal}, ${accent})`,
                  boxShadow: `0 0 18px ${auroraTint(accent, 0.38)}`,
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: aurora.txMid,
              fontFamily: aurora.font.mono,
              fontWeight: 700,
              pb: 0.25,
            }}
          >
            50%
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            display: "grid",
            gap: 1.4,
            pl: 0.5,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 10.5,
              top: 12,
              bottom: 12,
              width: 1,
              background: `linear-gradient(180deg, ${auroraTint(accent, 0.42)}, ${auroraTint(aurora.txHi, 0.08)})`,
            }}
          />
          {STEPS.map((s, i) => {
            const tint = TINTS[s.tint];
            return (
              <Box
                key={s.label}
                component={motion.div}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr auto",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: s.active
                      ? `0 0 18px ${auroraTint(tint, 0.24)}`
                      : "none",
                    background: s.done
                      ? tint
                      : s.active
                        ? auroraTint(tint, 0.18)
                        : "transparent",
                    border: `1.5px solid ${s.done || s.active ? tint : auroraTint(aurora.txMid, 0.3)}`,
                    color: s.done ? aurora.tealInk : tint,
                    flexShrink: 0,
                  }}
                >
                  {s.done && <Check size={14} strokeWidth={3} />}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: s.done || s.active ? aurora.txHi : aurora.txMid,
                      fontFamily: aurora.font.ui,
                      fontWeight: s.active ? 600 : 500,
                      letterSpacing: "-0.01em",
                      opacity: s.done ? 0.7 : 1,
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.55,
                      height: 1.5,
                      width: s.active ? "100%" : s.done ? "88%" : "72%",
                      borderRadius: 999,
                      background:
                        s.done || s.active
                          ? auroraTint(tint, 0.42)
                          : auroraTint(aurora.txHi, 0.12),
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      s.done || s.active ? tint : auroraTint(aurora.txMid, 0.5),
                    fontFamily: aurora.font.mono,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.done ? "Done" : s.active ? "Now" : ""}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </SlideVisualFrame>
  );
}

export function ProgressSlide({ reversed }: { reversed?: boolean }) {
  return (
    <SlideShell
      eyebrow="Track every step"
      title="Progress that keeps moving"
      body="Quick quizzes mark what is done and surface the next step."
      visual={<ProgressVisual />}
      accent={aurora.status.enrich}
      reversed={reversed}
    />
  );
}
