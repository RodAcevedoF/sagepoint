"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { Search, Brain, GitBranch, BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  GenerationStage,
  type GenerationStageData,
  type StageState,
} from "./GenerationStage";
import { makeStyles } from "./GenerationView.styles";

import type { RoadmapEventStage } from "@/common/hooks/useRoadmapEvents";

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
    </MotionBox>
  );
}
