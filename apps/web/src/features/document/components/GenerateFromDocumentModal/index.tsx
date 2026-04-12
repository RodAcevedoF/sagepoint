"use client";

import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, useModal, useSnackbar } from "@/shared/components";
import { ButtonTypes, ButtonIconPositions } from "@/shared/types";
import { useGenerateRoadmapCommand } from "@/application/roadmap";
import {
  ExperienceLevelSelector,
  type ExperienceLevel,
} from "./ExperienceLevelSelector";
import {
  CommitmentLevelSelector,
  COMMITMENT_LEVELS,
  type CommitmentLevel,
} from "./CommitmentLevelSelector";
import { GeneratingPhase } from "./GeneratingPhase";

const MotionBox = motion.create(Box);

interface GenerateFromDocumentModalProps {
  documentId: string;
  documentName: string;
}

export function GenerateFromDocumentModal({
  documentId,
  documentName,
}: GenerateFromDocumentModalProps) {
  const { closeModal } = useModal();
  const { showSnackbar } = useSnackbar();
  const { execute, isLoading, error } = useGenerateRoadmapCommand();

  const [title, setTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>();
  const [commitment, setCommitment] = useState<CommitmentLevel>();
  const [goal, setGoal] = useState("");
  const [phase, setPhase] = useState<"form" | "loading">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("loading");
    try {
      await execute(documentId, {
        title: title.trim() || undefined,
        userContext:
          experienceLevel || commitment || goal.trim()
            ? {
                experienceLevel,
                goal: goal.trim() || undefined,
                timeAvailable: commitment
                  ? COMMITMENT_LEVELS.find((c) => c.id === commitment)?.hours
                  : undefined,
              }
            : undefined,
        navigateOnSuccess: true,
      });
      closeModal();
    } catch {
      setPhase("form");
      showSnackbar("Failed to generate roadmap", { severity: "error" });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "form" ? (
        <MotionBox
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Generate a learning roadmap from the concepts extracted from{" "}
              <strong>{documentName}</strong>.
            </Typography>

            <TextField
              fullWidth
              label="Roadmap title (optional)"
              placeholder="Auto-generated from document concepts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <ExperienceLevelSelector
              value={experienceLevel}
              onChange={setExperienceLevel}
              disabled={isLoading}
            />

            <CommitmentLevelSelector
              value={commitment}
              onChange={setCommitment}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Learning goal (optional)"
              placeholder="e.g. Prepare for an exam, build a project..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isLoading}
              multiline
              minRows={2}
              sx={{ mb: 3 }}
            />

            {error && (
              <Typography variant="body2" sx={{ color: "error.light", mb: 2 }}>
                Something went wrong. Please try again.
              </Typography>
            )}

            <Button
              type={ButtonTypes.SUBMIT}
              label="Generate Roadmap"
              icon={Sparkles}
              iconPos={ButtonIconPositions.START}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
          </Box>
        </MotionBox>
      ) : (
        <GeneratingPhase key="loading" />
      )}
    </AnimatePresence>
  );
}
