"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { SlideShell, SlideVisualFrame } from "./SlideShell";

const DAYS = [1, 2, 3, 4, 5, 6, 7];

function StreakVisual() {
  const theme = useTheme();
  const accent = theme.palette.warning.light;

  return (
    <SlideVisualFrame label="RHYTHM SIGNAL" accent={accent}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 344,
          display: "grid",
          gap: 2.2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 2,
            alignItems: "end",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: "2.3rem",
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                fontWeight: 700,
              }}
            >
              4
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.72),
                fontWeight: 700,
                letterSpacing: "0.12em",
              }}
            >
              DAY RUN
            </Typography>
          </Box>
          <Box
            sx={{
              pb: 0.75,
              borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
              Practice clusters are forming at the same hour.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 1,
            alignItems: "end",
            height: 124,
            pt: 0.5,
          }}
        >
          {DAYS.map((day, index) => {
            const active = index < 4;
            const height = [54, 82, 110, 96, 52, 38, 30][index];
            return (
              <Box
                key={day}
                component={motion.div}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14 + index * 0.08 }}
                sx={{
                  display: "grid",
                  justifyItems: "center",
                  gap: 0.85,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "end",
                    height: 112,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height,
                      borderRadius: 999,
                      background: active
                        ? `linear-gradient(180deg, ${alpha(theme.palette.success.light, 0.94)}, ${alpha(accent, 0.84)})`
                        : alpha(theme.palette.common.white, 0.12),
                      boxShadow: active
                        ? `0 0 18px ${alpha(accent, 0.24)}`
                        : "none",
                      position: "relative",
                    }}
                  >
                    {active && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -7,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: theme.palette.common.white,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: active
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  {day}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            pt: 1.15,
            borderTop: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: alpha(theme.palette.primary.light, 0.14),
                color: theme.palette.primary.light,
              }}
            >
              <Zap size={15} />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.primary, fontWeight: 700 }}
              >
                19:00 - 20:00
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                Best learning window
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.78),
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            4 sessions this week
          </Typography>
        </Box>
      </Box>
    </SlideVisualFrame>
  );
}

export function StreakSlide({ reversed }: { reversed?: boolean }) {
  const theme = useTheme();
  return (
    <SlideShell
      eyebrow="Keep momentum"
      title="See your rhythm form"
      body="Streaks and time cues keep the plan moving."
      visual={<StreakVisual />}
      accent={theme.palette.warning.light}
      reversed={reversed}
    />
  );
}
