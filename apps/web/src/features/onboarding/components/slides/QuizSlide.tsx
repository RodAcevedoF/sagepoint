"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
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
  return (
    <SlideVisualFrame label="KNOWLEDGE CHECK" accent={aurora.status.concept}>
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
            color: aurora.txMid,
            fontFamily: aurora.font.mono,
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
                borderBottom: `1px solid ${isCorrect ? auroraTint(aurora.status.ready, 0.26) : auroraTint(aurora.txHi, 0.1)}`,
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
                    ? auroraTint(aurora.status.ready, 0.22)
                    : auroraTint(aurora.teal, 0.08),
                  border: `1px solid ${isCorrect ? auroraTint(aurora.status.ready, 0.4) : auroraTint(aurora.teal, 0.22)}`,
                  color: isCorrect ? aurora.status.ready : aurora.teal,
                  fontFamily: aurora.font.mono,
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
                    color: aurora.txHi,
                    fontFamily: aurora.font.ui,
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
                    background: isCorrect
                      ? auroraTint(aurora.status.ready, 0.44)
                      : auroraTint(aurora.txHi, 0.12),
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
                  <Sparkles size={13} color={aurora.status.ready} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: aurora.status.ready,
                      fontFamily: aurora.font.mono,
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
  return (
    <SlideShell
      eyebrow="Quick checks"
      title="Check the idea fast"
      body="Short quizzes confirm the idea while it is fresh."
      visual={<QuizVisual />}
      accent={aurora.status.concept}
      reversed={reversed}
    />
  );
}
