"use client";

import { Box, TextField, Typography } from "@mui/material";
import { Sparkles, Plus } from "lucide-react";
import { Button, ModalTitle, ResourceQuotaBar } from "@/shared/components";
import { ButtonTypes, ButtonIconPositions, ButtonSizes } from "@/shared/types";
import { RoadmapRecommendations } from "../RoadmapRecommendations";
import {
  ExperienceLevelSelector,
  type ExperienceLevel,
} from "../ExperienceLevelSelector";
import {
  CommitmentLevelSelector,
  type CommitmentLevel,
} from "../Category/CommitmentLevelSelector";
import type { ResourceQuotaDto } from "@/infrastructure/api/userApi";
import { styles } from "./GenerationForm.styles";

interface GenerationFormProps {
  topic: string;
  title: string;
  experienceLevel: ExperienceLevel | undefined;
  commitment: CommitmentLevel | undefined;
  isLoading: boolean;
  limitReached: boolean;
  errorMessage: string | null;
  quota: ResourceQuotaDto | undefined;
  onTopicChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onExperienceLevelChange: (value: ExperienceLevel | undefined) => void;
  onCommitmentChange: (value: CommitmentLevel | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function GenerationForm({
  topic,
  title,
  experienceLevel,
  commitment,
  isLoading,
  limitReached,
  errorMessage,
  quota,
  onTopicChange,
  onTitleChange,
  onExperienceLevelChange,
  onCommitmentChange,
  onSubmit,
}: GenerationFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={styles.container}>
      <ModalTitle
        eyebrow="Generate"
        title="Create Roadmap"
        icon={<Plus size={20} />}
        tone="teal"
      />

      <TextField
        autoFocus
        fullWidth
        label="What do you want to learn?"
        placeholder="e.g. React, Machine Learning, Docker..."
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        disabled={isLoading}
        slotProps={{ htmlInput: { maxLength: 280 } }}
        helperText={`${topic.length}/280`}
        sx={styles.textField}
      />

      <RoadmapRecommendations topic={topic} disabled={isLoading} />

      <TextField
        fullWidth
        label="Roadmap name (optional)"
        placeholder="Auto-generated from topic if left blank"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        disabled={isLoading}
        slotProps={{ htmlInput: { maxLength: 120 } }}
        sx={styles.textField}
      />

      <ExperienceLevelSelector
        value={experienceLevel}
        onChange={onExperienceLevelChange}
        disabled={isLoading}
      />

      <CommitmentLevelSelector
        value={commitment}
        onChange={onCommitmentChange}
        disabled={isLoading}
      />

      {quota && (
        <ResourceQuotaBar
          balance={quota.balance}
          cost={quota.costs.TOPIC_ROADMAP}
          costLabel="Generating a roadmap"
        />
      )}

      {errorMessage && (
        <Typography variant="body2" sx={styles.errorText}>
          {errorMessage}
        </Typography>
      )}

      <Button
        type={ButtonTypes.SUBMIT}
        label={limitReached ? "Limit Reached" : "Generate Roadmap"}
        icon={Sparkles}
        iconPos={ButtonIconPositions.START}
        size={ButtonSizes.LARGE}
        disabled={!topic.trim() || isLoading || limitReached}
        loading={isLoading}
        fullWidth
      />
    </Box>
  );
}
