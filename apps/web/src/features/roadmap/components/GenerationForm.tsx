"use client";

import { Box, TextField, Typography, useTheme } from "@mui/material";
import { Sparkles } from "lucide-react";
import { Button, ResourceQuotaBar } from "@/common/components";
import { ButtonTypes, ButtonIconPositions, ButtonSizes } from "@/common/types";
import { RoadmapRecommendations } from "./RoadmapRecommendations";
import {
  ExperienceLevelSelector,
  type ExperienceLevel,
} from "./ExperienceLevelSelector";
import type { ResourceQuotaDto } from "@/infrastructure/api/userApi";
import { makeStyles } from "./GenerationView.styles";

interface GenerationFormProps {
  topic: string;
  title: string;
  experienceLevel: ExperienceLevel | undefined;
  isLoading: boolean;
  limitReached: boolean;
  errorMessage: string | null;
  quota: ResourceQuotaDto | undefined;
  fromOnboarding?: boolean;
  onTopicChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onExperienceLevelChange: (value: ExperienceLevel | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function GenerationForm({
  topic,
  title,
  experienceLevel,
  isLoading,
  limitReached,
  errorMessage,
  quota,
  fromOnboarding,
  onTopicChange,
  onTitleChange,
  onExperienceLevelChange,
  onSubmit,
}: GenerationFormProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const headingTitle = fromOnboarding
    ? "Let's create your first roadmap!"
    : "Create a Learning Roadmap";

  const headingSubtitle = fromOnboarding
    ? "We've pre-filled your goal. Adjust if needed and hit generate!"
    : "Tell us what you want to learn and AI will build a personalized path.";

  return (
    <Box component="form" onSubmit={onSubmit} sx={styles.inputCard}>
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
        onChange={(e) => onTopicChange(e.target.value)}
        disabled={isLoading}
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
        sx={styles.nameField}
      />

      <ExperienceLevelSelector
        value={experienceLevel}
        onChange={onExperienceLevelChange}
        disabled={isLoading}
      />

      {quota &&
        quota.roadmaps.max !== null &&
        quota.roadmaps.remaining !== null && (
          <Box sx={{ mb: 2 }}>
            <ResourceQuotaBar
              used={quota.roadmaps.used}
              max={quota.roadmaps.max}
              remaining={quota.roadmaps.remaining}
              label="Roadmaps used"
              limitReachedMessage="Limit reached — delete a roadmap to create more"
            />
          </Box>
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
