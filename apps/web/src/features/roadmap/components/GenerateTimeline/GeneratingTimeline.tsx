"use client";

import { Box, Typography, useTheme, type Theme } from "@mui/material";
import {
  Search,
  Brain,
  GitBranch,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Target,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  GenerationStage,
  type GenerationStageData,
  type StageState,
} from "../GenerationStage";
import { makeStyles } from "./GenerationView.styles";
import { InfoCardCarousel } from "@/features/onboarding/components/animations/InfoCardCarousel";
import { JitterText } from "@/features/onboarding/components/animations/JitterText";

import type { RoadmapEventStage } from "@/shared/hooks/useRoadmapEvents";

const MotionBox = motion.create(Box);

const GENERATION_STAGES: GenerationStageData[] = [
  {
    label: "Analyzing topic...",
    description: "Understanding your learning goals",
    icon: Search,
  },
  {
    label: "Generating concepts...",
    description: "Identifying key topics to cover",
    icon: Brain,
  },
  {
    label: "Building learning path...",
    description: "Ordering concepts for optimal learning",
    icon: GitBranch,
  },
  {
    label: "Discovering resources...",
    description: "Finding the best learning materials",
    icon: BookOpen,
  },
  { label: "Done!", description: "Your roadmap is ready", icon: CheckCircle2 },
];

type InfoCard = {
  icon: typeof Sparkles;
  title: string;
  body: string;
  accent: (theme: Theme) => string;
};

const INFO_CARDS: InfoCard[] = [
  {
    icon: Sparkles,
    title: "AI-powered roadmaps",
    body: "We turn your goal into a structured, step-by-step path tailored to your level.",
    accent: (t) => t.palette.primary.light,
  },
  {
    icon: Target,
    title: "Built around your time",
    body: "Each plan respects your weekly commitment so progress feels achievable.",
    accent: (t) => t.palette.purple.light,
  },
  {
    icon: Layers,
    title: "Curated resources",
    body: "Every concept ships with hand-picked materials — no more endless searching.",
    accent: (t) => t.palette.accent as string,
  },
];

function stageToIndex(stage: RoadmapEventStage): number {
  switch (stage) {
    case "concepts":
      return 1;
    case "learning-path":
      return 2;
    case "resources":
      return 3;
    case "done":
      return 4;
    default:
      return 0;
  }
}

function getStageState(stageIndex: number, activeStage: number): StageState {
  if (stageIndex < activeStage) return "completed";
  if (stageIndex === activeStage) return "active";
  return "pending";
}

interface GeneratingTimelineProps {
  topic: string;
  sseStage: RoadmapEventStage | null;
}

export function GeneratingTimeline({
  topic,
  sseStage,
}: GeneratingTimelineProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const activeStage = sseStage ? stageToIndex(sseStage) : 0;

  return (
    <MotionBox
      key="generating"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={styles.generatingCard}>
        <Box sx={styles.generatingLayout}>
          <Box>
            <Typography variant="h5" sx={styles.generatingTitle}>
              Generating your roadmap
            </Typography>
            <Typography variant="body2" sx={styles.generatingSubtitle}>
              Creating a personalized learning path for <strong>{topic}</strong>
            </Typography>

            <Box sx={styles.stagesWrapper}>
              {GENERATION_STAGES.map((stage, index) => (
                <GenerationStage
                  key={stage.label}
                  {...stage}
                  state={getStageState(index, activeStage)}
                  isLast={index === GENERATION_STAGES.length - 1}
                />
              ))}
            </Box>
          </Box>

          <Box sx={styles.cardSwapStage}>
            <InfoCardCarousel
              width={420}
              height={260}
              delay={3500}
              pauseOnHover
            >
              {INFO_CARDS.map(({ icon: Icon, title, body, accent }) => {
                const accentColor = accent(theme);
                return (
                  <Box key={title} sx={styles.infoCard(accentColor)}>
                    <Box sx={styles.infoCardIcon(accentColor)}>
                      <Icon size={24} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={styles.infoCardTitle(accentColor)}
                    >
                      <JitterText text={title} amplitude={1.2} />
                    </Typography>
                    <Typography variant="body1" sx={styles.infoCardBody}>
                      <JitterText text={body} amplitude={0.7} />
                    </Typography>
                  </Box>
                );
              })}
            </InfoCardCarousel>
          </Box>
        </Box>
      </Box>
    </MotionBox>
  );
}
