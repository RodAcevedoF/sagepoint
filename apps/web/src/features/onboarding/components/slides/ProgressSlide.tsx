"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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

function ProgressVisual() {
  const theme = useTheme();
  const accent = theme.palette.accent as string;
  const completedCount = STEPS.filter((step) => step.done).length;
  const tints = {
    primary: theme.palette.primary.light,
    success: theme.palette.success.light,
    accent,
    secondary: theme.palette.secondary.light,
  };

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
              fontSize: "2.3rem",
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            0{completedCount}
          </Typography>
          <Box sx={{ display: "grid", gap: 0.75 }}>
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.78),
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
                background: alpha(accent, 0.12),
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
                  background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${accent})`,
                  boxShadow: `0 0 18px ${alpha(accent, 0.38)}`,
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
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
              background: `linear-gradient(180deg, ${alpha(accent, 0.42)}, ${alpha(theme.palette.common.white, 0.08)})`,
            }}
          />
          {STEPS.map((s, i) => {
            const tint = tints[s.tint];
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
                      ? `0 0 18px ${alpha(tint, 0.24)}`
                      : "none",
                    background: s.done
                      ? tint
                      : s.active
                        ? alpha(tint, 0.18)
                        : "transparent",
                    border: `1.5px solid ${s.done || s.active ? tint : alpha(theme.palette.text.secondary, 0.3)}`,
                    color: s.done ? theme.palette.background.default : tint,
                    flexShrink: 0,
                  }}
                >
                  {s.done && <Check size={14} strokeWidth={3} />}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        s.done || s.active
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
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
                          ? alpha(tint, 0.42)
                          : alpha(theme.palette.common.white, 0.12),
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      s.done || s.active
                        ? tint
                        : alpha(theme.palette.text.secondary, 0.5),
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
  const theme = useTheme();
  return (
    <SlideShell
      eyebrow="Track every step"
      title="Progress that keeps moving"
      body="Quick quizzes mark what is done and surface the next step."
      visual={<ProgressVisual />}
      accent={theme.palette.accent as string}
      reversed={reversed}
    />
  );
}
