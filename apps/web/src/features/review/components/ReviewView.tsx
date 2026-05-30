"use client";

import { useMemo, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Brain, HelpCircle, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Loader, EmptyState, Button } from "@/shared/components";
import { ButtonVariants, ButtonSizes } from "@/shared/types";
import { ReviewSource } from "@sagepoint/domain";
import {
  useReviewQueueQuery,
  useGradeReviewCommand,
} from "@/application/review";
import { ReviewQuestionCard } from "./ReviewQuestionCard";
import { makeStyles } from "./ReviewView.styles";

const MotionBox = motion.create(Box);

interface ReviewViewProps {
  source?: ReviewSource;
  sourceId?: string;
}

interface GradeOption {
  label: string;
  quality: number;
  variant: ButtonVariants;
}

const GRADES: readonly GradeOption[] = [
  { label: "Again", quality: 1, variant: ButtonVariants.DANGER },
  { label: "Hard", quality: 3, variant: ButtonVariants.OUTLINED },
  { label: "Good", quality: 4, variant: ButtonVariants.DEFAULT },
  { label: "Easy", quality: 5, variant: ButtonVariants.SECONDARY },
];

export function ReviewView({ source, sourceId }: ReviewViewProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const queueArgs = useMemo(
    () => (source ? { source, sourceId } : undefined),
    [source, sourceId],
  );
  const {
    data: queue,
    isLoading,
    isFetching,
    refetch,
  } = useReviewQueueQuery(queueArgs);
  const { execute: gradeReview, isLoading: grading } = useGradeReviewCommand();

  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState(0);

  if (isLoading) {
    return <Loader variant="page" message="Loading review" />;
  }

  const items = queue ?? [];
  const total = items.length;
  const current = items[cursor];
  const allDone = total === 0 || cursor >= total;

  const handleGrade = async (quality: number) => {
    if (!current) return;
    const result = await gradeReview(current.cardId, quality, {
      source: current.source,
      sourceId: current.sourceId,
    });
    if (!result.ok) return;

    setCompleted((c) => c + 1);
    setSelected(undefined);
    setCursor((c) => c + 1);
  };

  const handleRefresh = () => {
    setCursor(0);
    setSelected(undefined);
    setCompleted(0);
    refetch();
  };

  if (allDone) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          sx={styles.heroCard}
        >
          <Box sx={styles.accentBar} />
          <Box sx={styles.orb} />
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
          >
            <Sparkles size={24} color={theme.palette.info.light} />
            <Typography
              variant="overline"
              sx={{ color: theme.palette.info.light, fontWeight: 600 }}
            >
              Review
            </Typography>
          </Box>
          <Typography variant="h4" sx={styles.title}>
            {completed > 0 ? "All caught up" : "No cards due"}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            {completed > 0
              ? `You reviewed ${completed} card${completed === 1 ? "" : "s"}.`
              : "Come back later — your queue is empty."}
          </Typography>
        </MotionBox>

        <EmptyState
          title="Nothing more to review right now"
          description="Cards become due based on your past answers."
          actionLabel="Check again"
          actionIcon={RotateCcw}
          onAction={handleRefresh}
        />
      </Box>
    );
  }

  const progressPercentage = total > 0 ? Math.round((cursor / total) * 100) : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        sx={styles.heroCard}
      >
        <Box sx={styles.accentBar} />
        <Box sx={styles.orb} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Brain size={24} color={theme.palette.info.light} />
          <Typography
            variant="overline"
            sx={{ color: theme.palette.info.light, fontWeight: 600 }}
          >
            Spaced Review
          </Typography>
        </Box>

        <Typography variant="h4" sx={styles.title}>
          {source === ReviewSource.DOCUMENT
            ? "Document review"
            : source === ReviewSource.ROADMAP_STEP
              ? "Roadmap step review"
              : "Your review queue"}
        </Typography>

        <Box sx={styles.metaRow}>
          <Box sx={styles.metaItem}>
            <HelpCircle size={16} color={theme.palette.text.secondary} />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {cursor + 1}/{total} cards
            </Typography>
          </Box>
          <Box sx={styles.progressBarTrack}>
            <Box sx={styles.progressBarFill(progressPercentage)} />
          </Box>
        </Box>
      </MotionBox>

      <MotionBox
        key={current.cardId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ReviewQuestionCard
          question={current.question}
          selectedAnswer={selected}
          onAnswer={setSelected}
          disabled={grading || isFetching}
        />
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, display: "block", mb: 1 }}
        >
          Rate how well you knew this:
        </Typography>
        <Box sx={styles.gradeRow}>
          {GRADES.map((grade) => (
            <Button
              key={grade.label}
              label={grade.label}
              variant={grade.variant}
              size={ButtonSizes.MEDIUM}
              onClick={() => handleGrade(grade.quality)}
              disabled={grading || isFetching}
            />
          ))}
        </Box>
      </MotionBox>
    </Box>
  );
}
