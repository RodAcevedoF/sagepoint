"use client";

import { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ChevronDown, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepStatus, type RoadmapStep } from "@sagepoint/domain";
import { useUpdateProgressCommand } from "@/application/roadmap";
import { SubConceptItem } from "./SubConceptItem";
import { makeStyles } from "./SubConceptAccordion.styles";

const MotionBox = motion.create(Box);

interface SubConceptAccordionProps {
  subSteps: RoadmapStep[];
  stepProgress: Record<string, StepStatus>;
  parentOrder: number;
  roadmapId: string;
  isOwner: boolean;
}

export function SubConceptAccordion({
  subSteps,
  stepProgress,
  parentOrder,
  roadmapId,
  isOwner,
}: SubConceptAccordionProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { execute: updateProgress } = useUpdateProgressCommand();

  if (subSteps.length === 0) return null;

  const completedCount = subSteps.filter(
    (s) => stepProgress[s.concept.id] === StepStatus.COMPLETED,
  ).length;
  const total = subSteps.length;
  const styles = makeStyles(theme, completedCount === total);

  const handleToggle = async (conceptId: string) => {
    const current = stepProgress[conceptId] ?? StepStatus.NOT_STARTED;
    const next =
      current === StepStatus.COMPLETED
        ? StepStatus.NOT_STARTED
        : StepStatus.COMPLETED;

    setTogglingId(conceptId);
    await updateProgress(roadmapId, conceptId, next);
    setTogglingId(null);
  };

  return (
    <Box sx={styles.container}>
      <Box onClick={() => setOpen((prev) => !prev)} sx={styles.header}>
        <Box sx={styles.headerLeft}>
          <GitBranch size={14} color={theme.palette.secondary.light} />
          <Typography variant="caption" sx={styles.titleText}>
            {total} recommended sub-topic{total !== 1 ? "s" : ""}
          </Typography>
          <Typography variant="caption" sx={styles.progressText}>
            {completedCount}/{total} done
          </Typography>
        </Box>

        <MotionBox
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          sx={styles.chevron}
        >
          <ChevronDown size={16} />
        </MotionBox>
      </Box>

      <AnimatePresence>
        {open && (
          <MotionBox
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            sx={{ overflow: "hidden" }}
          >
            <Box sx={styles.content}>
              {subSteps.map((sub, i) => (
                <SubConceptItem
                  key={sub.concept.id}
                  step={sub}
                  status={
                    stepProgress[sub.concept.id] ?? StepStatus.NOT_STARTED
                  }
                  label={`${parentOrder}.${i + 1}`}
                  onToggle={
                    isOwner ? () => handleToggle(sub.concept.id) : undefined
                  }
                  isLoading={togglingId === sub.concept.id}
                />
              ))}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
