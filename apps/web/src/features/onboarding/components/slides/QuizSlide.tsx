"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SlideShell, SlideVisualFrame } from "./SlideShell";

const OPTIONS = [
  {
    label: "Async keeps the main flow free while work finishes later.",
    state: "correct",
  },
  {
    label: "Async always means extra CPU threads.",
    state: "idle",
  },
  {
    label: "Await replaces functions.",
    state: "idle",
  },
];

function QuizVisual() {
  const theme = useTheme();

  return (
    <SlideVisualFrame
      label="KNOWLEDGE CHECK"
      accent={theme.palette.secondary.light}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 344,
          display: "grid",
          gap: 1.2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.76),
            fontWeight: 700,
            letterSpacing: "0.1em",
            mb: 0.15,
          }}
        >
          Which line is actually true?
        </Typography>

        {OPTIONS.map((option, index) => {
          const isCorrect = option.state === "correct";
          return (
            <Box
              key={option.label}
              component={motion.div}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 + index * 0.14 }}
              sx={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto",
                alignItems: "start",
                gap: 1.25,
                pb: 1.15,
                borderBottom: `1px solid ${alpha(isCorrect ? theme.palette.success.light : theme.palette.common.white, isCorrect ? 0.26 : 0.1)}`,
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
                  background: isCorrect
                    ? alpha(theme.palette.success.light, 0.22)
                    : alpha(theme.palette.primary.light, 0.08),
                  border: `1px solid ${alpha(isCorrect ? theme.palette.success.light : theme.palette.primary.light, isCorrect ? 0.4 : 0.22)}`,
                  color: isCorrect
                    ? theme.palette.success.light
                    : theme.palette.primary.light,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {String.fromCharCode(65 + index)}
              </Box>
              <Box sx={{ pt: 0.1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: isCorrect ? 600 : 500,
                    fontSize: 13,
                    lineHeight: 1.4,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {option.label}
                </Typography>
                <Box
                  sx={{
                    mt: 0.6,
                    height: 1.5,
                    width: isCorrect ? "100%" : "72%",
                    borderRadius: 999,
                    background: alpha(
                      isCorrect
                        ? theme.palette.success.light
                        : theme.palette.common.white,
                      isCorrect ? 0.44 : 0.12,
                    ),
                  }}
                />
              </Box>
              {isCorrect && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    pt: 0.15,
                  }}
                >
                  <Sparkles size={13} color={theme.palette.success.light} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.success.light,
                      fontWeight: 700,
                    }}
                  >
                    Best pick
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </SlideVisualFrame>
  );
}

export function QuizSlide({ reversed }: { reversed?: boolean }) {
  const theme = useTheme();
  return (
    <SlideShell
      eyebrow="Quick checks"
      title="Check the idea fast"
      body="Short quizzes confirm the idea while it is fresh."
      visual={<QuizVisual />}
      accent={theme.palette.secondary.light}
      reversed={reversed}
    />
  );
}
