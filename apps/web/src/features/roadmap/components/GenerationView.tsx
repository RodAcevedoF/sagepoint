"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, useTheme, Button as MuiButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGenerateTopicRoadmapCommand } from "@/application/roadmap";
import { useRoadmapEvents } from "@/shared/hooks";
import { useGetResourceQuotaQuery } from "@/infrastructure/api/userApi";
import {
  isExperienceLevel,
  type ExperienceLevel,
} from "./ExperienceLevelSelector";
import {
  COMMITMENT_LEVELS,
  type CommitmentLevel,
} from "./CommitmentLevelSelector";
import { GeneratingTimeline } from "./GeneratingTimeline";
import { GenerationForm } from "./GenerationForm";

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
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic || "");
  const [title, setTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    ExperienceLevel | undefined
  >(isExperienceLevel(initialExperience) ? initialExperience : undefined);
  const [commitment, setCommitment] = useState<CommitmentLevel | undefined>();
  const [phase, setPhase] = useState<"input" | "generating">("input");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roadmapId, setRoadmapId] = useState<string | null>(null);

  const { execute, isLoading } = useGenerateTopicRoadmapCommand();
  const { data: quota } = useGetResourceQuotaQuery();
  const roadmapLimitReached =
    quota !== undefined &&
    quota.balance !== null &&
    quota.balance < quota.costs.TOPIC_ROADMAP;
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

      const timeAvailable = commitment
        ? COMMITMENT_LEVELS.find((c) => c.id === commitment)?.hours
        : undefined;

      const result = await execute(topic.trim(), title.trim() || undefined, {
        userContext:
          experienceLevel || timeAvailable
            ? { experienceLevel, timeAvailable }
            : undefined,
      });

      if (result.ok) {
        if (fromOnboarding) {
          setRoadmapId(result.data.id);
        } else {
          router.push("/roadmaps");
        }
      } else {
        setPhase("input");
        setErrorMessage(
          result.error.tag === "ROADMAP_LIMIT"
            ? "Not enough tokens. Contact your administrator to get more."
            : "Something went wrong generating your roadmap. Please try again.",
        );
      }
    },
    [
      topic,
      title,
      experienceLevel,
      commitment,
      execute,
      fromOnboarding,
      router,
    ],
  );

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
          <GenerationForm
            topic={topic}
            title={title}
            experienceLevel={experienceLevel}
            commitment={commitment}
            isLoading={isLoading}
            limitReached={roadmapLimitReached ?? false}
            errorMessage={displayError}
            quota={quota}
            fromOnboarding={fromOnboarding}
            onTopicChange={setTopic}
            onTitleChange={setTitle}
            onExperienceLevelChange={setExperienceLevel}
            onCommitmentChange={setCommitment}
            onSubmit={handleSubmit}
          />
        </MotionBox>
      ) : (
        <GeneratingTimeline topic={topic} sseStage={sseStage} />
      )}
    </AnimatePresence>
  );
}
