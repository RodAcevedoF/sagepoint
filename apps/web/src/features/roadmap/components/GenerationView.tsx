"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  useTheme,
  Button as MuiButton,
} from "@mui/material";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/common/components";
import { ButtonTypes, ButtonIconPositions, ButtonSizes } from "@/common/types";
import { RoadmapRecommendations } from "./RoadmapRecommendations";
import { useGenerateTopicRoadmapCommand } from "@/application/roadmap";
import { useRoadmapEvents } from "@/common/hooks";
import {
  ExperienceLevelSelector,
  isExperienceLevel,
  type ExperienceLevel,
} from "./ExperienceLevelSelector";
import { GeneratingTimeline } from "./GeneratingTimeline";
import { makeStyles } from "./GenerationView.styles";

const MotionBox = motion.create(Box);

const DONE_DELAY_MS = 1500;

export interface GenerationViewProps {
  initialTopic?: string;
  initialExperience?: string;
  fromOnboarding?: boolean;
}

export function GenerationView({
  initialTopic,
  initialExperience,
  fromOnboarding,
}: GenerationViewProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic || "");
  const [title, setTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    ExperienceLevel | undefined
  >(isExperienceLevel(initialExperience) ? initialExperience : undefined);
  const [phase, setPhase] = useState<"input" | "generating">("input");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);

  const { execute, isLoading, error } = useGenerateTopicRoadmapCommand();
  const {
    status: sseStatus,
    stage: sseStage,
    errorMessage: sseError,
  } = useRoadmapEvents(roadmapId);

  // Derive effective phase: SSE failure resets to input
  const effectivePhase =
    phase === "generating" && sseStatus === "failed" ? "input" : phase;
  const displayError =
    sseStatus === "failed"
      ? sseError ||
        "Something went wrong generating your roadmap. Please try again."
      : errorMessage;

  // Handle SSE completed → redirect
  useEffect(() => {
    if (!roadmapId || sseStatus !== "completed") return;

    const timeout = setTimeout(() => {
      router.push(`/roadmaps/${roadmapId}`);
    }, DONE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [sseStatus, roadmapId, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!topic.trim()) return;

      setErrorMessage(null);
      setPhase("generating");
      setRoadmapId(null);

      try {
        const roadmap = await execute(topic.trim(), title.trim() || undefined, {
          userContext: experienceLevel ? { experienceLevel } : undefined,
        });

        if (fromOnboarding) {
          setRoadmapId(roadmap.id);
        } else {
          router.push("/roadmaps");
        }
      } catch {
        setPhase("input");
        setErrorMessage(
          "Something went wrong generating your roadmap. Please try again.",
        );
      }
    },
    [topic, title, experienceLevel, execute, fromOnboarding, router],
  );

  const headingTitle = fromOnboarding
    ? "Let's create your first roadmap!"
    : "Create a Learning Roadmap";

  const headingSubtitle = fromOnboarding
    ? "We've pre-filled your goal. Adjust if needed and hit generate!"
    : "Tell us what you want to learn and AI will build a personalized path.";

  return (
    <AnimatePresence mode="wait">
      {effectivePhase === "input" ? (
        <MotionBox
          key="input"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {!fromOnboarding && (
            <MuiButton
              startIcon={<ArrowLeft size={18} />}
              onClick={() => router.push("/roadmaps")}
              sx={{
                mb: 2,
                color: theme.palette.text.secondary,
                fontWeight: 600,
                "&:hover": { color: theme.palette.text.primary },
              }}
            >
              Back to Roadmaps
            </MuiButton>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={styles.inputCard}>
            <Box sx={styles.iconCenter}>
              <Box sx={styles.iconWrapper}>
                <Sparkles size={28} />
              </Box>
            </Box>

            <Typography variant="h5" sx={styles.title}>
              {headingTitle}
            </Typography>

            <Typography variant="body2" sx={styles.subtitle}>
              {headingSubtitle}
            </Typography>

            <TextField
              autoFocus
              fullWidth
              label="What do you want to learn?"
              placeholder="e.g. React, Machine Learning, Docker..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              sx={styles.textField}
            />

            <RoadmapRecommendations topic={topic} disabled={isLoading} />

            <TextField
              fullWidth
              label="Roadmap name (optional)"
              placeholder="Auto-generated from topic if left blank"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              sx={styles.nameField}
            />

            <ExperienceLevelSelector
              value={experienceLevel}
              onChange={setExperienceLevel}
              disabled={isLoading}
            />

            {(displayError || error) && (
              <Typography variant="body2" sx={styles.errorText}>
                {displayError || "Something went wrong. Please try again."}
              </Typography>
            )}

            <Button
              type={ButtonTypes.SUBMIT}
              label="Generate Roadmap"
              icon={Sparkles}
              iconPos={ButtonIconPositions.START}
              size={ButtonSizes.LARGE}
              disabled={!topic.trim() || isLoading}
              loading={isLoading}
              fullWidth
            />
          </Box>
        </MotionBox>
      ) : (
        <GeneratingTimeline topic={topic} sseStage={sseStage} />
      )}
    </AnimatePresence>
  );
}
