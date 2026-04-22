"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  alpha,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { Clock, BookOpen, ArrowRight, Globe, Lock, Trash2 } from "lucide-react";
import { RoadmapVisibility } from "@sagepoint/domain";
import {
  useUpdateVisibilityCommand,
  useDeleteRoadmapCommand,
} from "@/application/roadmap";
import { useRouter } from "next/navigation";
import { Card, ConfirmDialog, useSnackbar } from "@/shared/components";
import { makeStyles } from "./RoadmapCard.styles";

import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
import {
  DIFFICULTY_COLORS,
  formatDuration,
  formatRelativeTime,
  getDifficultyDistribution,
  getStatus,
} from "../utils/roadmap.utils";

interface RoadmapCardProps {
  data: UserRoadmapDto;
}

export function RoadmapCard({ data }: RoadmapCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const { roadmap, progress } = data;
  const status = getStatus(progress);
  const difficultyDist = getDifficultyDistribution(roadmap.steps);
  const { execute: updateVisibility } = useUpdateVisibilityCommand();
  const { execute: deleteRoadmap } = useDeleteRoadmapCommand();
  const { showSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPublic = roadmap.visibility === RoadmapVisibility.PUBLIC;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    const result = await deleteRoadmap(roadmap.id);
    if (result.ok) showSnackbar("Roadmap deleted", { severity: "success" });
    else showSnackbar("Failed to delete roadmap", { severity: "error" });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateVisibility(
      roadmap.id,
      isPublic ? RoadmapVisibility.PRIVATE : RoadmapVisibility.PUBLIC,
    );
  };

  const styles = makeStyles(status.color, theme);

  return (
    <>
      <Card
        onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
        sx={styles.card}
        variant="glass"
      >
        <Card.Content>
          {/* Top row: Title + Progress ring */}
          <Box sx={styles.header}>
            <Box sx={styles.headerContent}>
              <Box sx={styles.titleContainer}>
                <Typography variant="h6" sx={styles.title}>
                  {roadmap.title}
                </Typography>
              </Box>
              {roadmap.description && (
                <Typography variant="body2" sx={styles.description}>
                  {roadmap.description}
                </Typography>
              )}
            </Box>

            {/* Circular progress ring */}
            <Box sx={styles.progressContainer}>
              {/* Track */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={64}
                thickness={4}
                sx={styles.progressTrack}
              />
              {/* Value */}
              <CircularProgress
                variant="determinate"
                value={progress.progressPercentage}
                size={64}
                thickness={4}
                sx={styles.progressValue}
              />
              <Box sx={styles.progressCenter}>
                <Typography variant="caption" sx={styles.progressText}>
                  {progress.progressPercentage}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Status badge */}
          <Box sx={styles.statusBadge}>
            <Chip size="small" label={status.label} sx={styles.statusChip} />
          </Box>

          {/* Stats row */}
          <Box sx={styles.statsRow}>
            <Box sx={styles.statItem}>
              <BookOpen size={18} color={theme.palette.text.secondary} />
              <Typography variant="caption" sx={styles.statText}>
                {progress.completedSteps}/{progress.totalSteps} steps
              </Typography>
            </Box>
            <Box sx={styles.statItem}>
              <Clock size={18} color={theme.palette.text.secondary} />
              <Typography variant="caption" sx={styles.statText}>
                {formatDuration(roadmap.totalEstimatedDuration)}
              </Typography>
            </Box>
          </Box>

          {/* Difficulty chips */}
          {Object.keys(difficultyDist).length > 0 && (
            <Box sx={styles.difficultyRow}>
              {Object.entries(difficultyDist).map(([difficulty, count]) => (
                <Chip
                  key={difficulty}
                  size="small"
                  label={`${count} ${difficulty}`}
                  sx={{
                    ...styles.difficultyChip,
                    bgcolor: alpha(
                      DIFFICULTY_COLORS[difficulty] ||
                        theme.palette.text.secondary,
                      0.1,
                    ),
                    color:
                      DIFFICULTY_COLORS[difficulty] ||
                      theme.palette.text.secondary,
                  }}
                />
              ))}
            </Box>
          )}
        </Card.Content>

        <Card.Footer>
          <Box sx={styles.footerContent}>
            <Box sx={styles.footerInfo}>
              <Tooltip
                title={
                  isPublic
                    ? "Public — click to make private"
                    : "Private — click to share publicly"
                }
              >
                <IconButton
                  size="small"
                  onClick={handleToggleVisibility}
                  sx={{ p: 0.5 }}
                >
                  {isPublic ? (
                    <Globe size={16} color={theme.palette.success.main} />
                  ) : (
                    <Lock size={16} color={theme.palette.text.secondary} />
                  )}
                </IconButton>
              </Tooltip>
              {roadmap.recommendedPace && (
                <Chip
                  size="small"
                  label={roadmap.recommendedPace}
                  sx={styles.paceChip}
                />
              )}
              <Typography variant="caption" sx={styles.relativeTime}>
                {formatRelativeTime(roadmap.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Delete roadmap">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  sx={styles.deleteButton}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Tooltip>
              <ArrowRight size={20} className="arrow-icon" />
            </Box>
          </Box>
        </Card.Footer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Roadmap"
        description={
          <>
            Are you sure you want to delete <strong>{roadmap.title}</strong>?
            All progress and quiz data will be lost. This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
