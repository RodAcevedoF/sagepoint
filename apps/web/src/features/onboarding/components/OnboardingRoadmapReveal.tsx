"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import type { RoadmapEventStage } from "@/shared/hooks/useRoadmapEvents";
import { makeStyles } from "./OnboardingRoadmapReveal.styles";
import { STAGES, stageToIndex } from "../utils/onboarding.utils";
import { Check } from "lucide-react";
import { FeatureReel } from "./animations/FeatureReel";
import { GraphSlide } from "./slides/GraphSlide";
import { MilestonesSlide } from "./slides/MilestonesSlide";
import { ProgressSlide } from "./slides/ProgressSlide";
import { QuizSlide } from "./slides/QuizSlide";
import { StreakSlide } from "./slides/StreakSlide";
import { useHideDashboardAppBar } from "@/shared/components/layout/AppBar/DashboardAppBarVisibilityContext";

const SLIDES = [
  <GraphSlide key="graph" />,
  <ProgressSlide key="progress" reversed />,
  <QuizSlide key="quiz" />,
  <MilestonesSlide key="milestones" reversed />,
  <StreakSlide key="streak" />,
];

const MotionCard = motion.create(Box);

interface Props {
  topic: string;
  sseStage: RoadmapEventStage | null;
}

export function OnboardingRoadmapReveal({ topic, sseStage }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const activeStage = sseStage ? stageToIndex(sseStage) : 0;
  useHideDashboardAppBar(true);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      sx={styles.card}
    >
      <Box
        component={motion.div}
        animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        sx={styles.orb1}
      />

      <Box
        component={motion.div}
        animate={{ x: [0, -14, 0], y: [0, 16, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        sx={styles.orb2}
      />

      <Box sx={styles.contentWrapper}>
        <Typography variant="caption" sx={styles.eyebrow}>
          Crafting your roadmap
        </Typography>

        <Typography variant="h3" sx={styles.title}>
          Generating &ldquo;{topic}&rdquo;
        </Typography>

        <Typography variant="body1" sx={styles.subtitle}>
          Tailored to your goals — this usually takes a moment
        </Typography>
      </Box>

      <Box sx={styles.bodyLayout}>
        <Box sx={styles.timelineWrapper}>
          {STAGES.map((stage, index) => {
            const stageColor = stage.color(theme);
            const prevColor =
              index > 0 ? STAGES[index - 1].color(theme) : stageColor;
            const state =
              index < activeStage
                ? "completed"
                : index === activeStage
                  ? "active"
                  : "pending";
            const isLast = index === STAGES.length - 1;
            const Icon = stage.icon;

            return (
              <Box key={stage.label} sx={styles.stageRow(state)}>
                <Box sx={styles.leftColumn}>
                  <Box sx={styles.dotWrapper}>
                    {state === "active" && (
                      <Box
                        component={motion.div}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        sx={styles.outerHalo(stageColor)}
                      />
                    )}

                    {state === "active" && (
                      <Box
                        component={motion.div}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        sx={styles.innerHalo(stageColor)}
                      />
                    )}

                    <Box sx={styles.dot(state, stageColor)}>
                      {state === "completed" ? (
                        <Check size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </Box>
                  </Box>

                  {!isLast && (
                    <Box sx={styles.connector(state, stageColor, prevColor)} />
                  )}
                </Box>

                <Box sx={styles.rightColumn(isLast)}>
                  <Typography
                    variant="body1"
                    sx={styles.stageLabel(state, stageColor)}
                  >
                    {stage.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={styles.stageDescription}>
                    {stage.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={styles.cardSwapStage}>
          <FeatureReel slides={SLIDES} interval={5200} pauseOnHover />
        </Box>
      </Box>
    </MotionCard>
  );
}
