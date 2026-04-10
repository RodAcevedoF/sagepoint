"use client";

import {
  alpha,
  Box,
  Chip,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";
import { Globe, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { palette } from "@/shared/theme";
import { Card } from "@/shared/components";
import {
  formatDuration,
  formatRelativeTime,
  getDifficultyDistribution,
  DIFFICULTY_COLORS,
} from "../utils/roadmap.utils";
import { LikeButton } from "./LikeButton";
import type { RoadmapDto } from "@/infrastructure/api/roadmapApi";

const styles: Record<string, SxProps<Theme>> = {
  card: {
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-4px)" },
  },
  publicBadge: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1,
  },
  publicLabel: {
    color: palette.success.main,
    fontWeight: 700,
  },
  title: {
    fontWeight: 700,
    mb: 1,
    letterSpacing: "-0.3px",
  },
  description: {
    color: palette.text.secondary,
    mb: 2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  chipsRow: {
    display: "flex",
    gap: 1,
    mb: 1.5,
    flexWrap: "wrap",
  },
  stepsChip: {
    bgcolor: alpha(palette.info.main, 0.1),
    color: palette.info.light,
    fontWeight: 600,
    fontSize: "0.8rem",
    border: "none",
  },
  durationChip: {
    bgcolor: alpha(palette.text.secondary, 0.08),
    color: palette.text.secondary,
    fontWeight: 600,
    fontSize: "0.8rem",
    border: "none",
  },
  difficultyRow: {
    display: "flex",
    gap: 0.5,
    flexWrap: "wrap",
  },
  difficultyChipBase: {
    height: 22,
    fontSize: "0.7rem",
    fontWeight: 600,
    border: "none",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerDate: {
    color: palette.text.secondary,
  },
};

interface ExploreCardProps {
  roadmap: RoadmapDto;
}

export function ExploreCard({ roadmap }: ExploreCardProps) {
  const router = useRouter();
  const difficultyDist = getDifficultyDistribution(roadmap.steps);

  return (
    <Card
      onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
      sx={styles.card}
      variant="glass"
    >
      <Card.Content>
        <Box sx={styles.publicBadge}>
          <Globe size={14} color={palette.success.main} />
          <Typography variant="caption" sx={styles.publicLabel}>
            Public
          </Typography>
        </Box>

        <Typography variant="h6" sx={styles.title}>
          {roadmap.title}
        </Typography>

        {roadmap.description && (
          <Typography variant="body2" sx={styles.description}>
            {roadmap.description}
          </Typography>
        )}

        <Box sx={styles.chipsRow}>
          <Chip
            size="small"
            icon={<BookOpen size={14} />}
            label={`${roadmap.steps.length} steps`}
            sx={styles.stepsChip}
          />
          {roadmap.totalEstimatedDuration && (
            <Chip
              size="small"
              label={formatDuration(roadmap.totalEstimatedDuration)}
              sx={styles.durationChip}
            />
          )}
        </Box>

        {Object.keys(difficultyDist).length > 0 && (
          <Box sx={styles.difficultyRow}>
            {Object.entries(difficultyDist).map(([difficulty, count]) => (
              <Chip
                key={difficulty}
                size="small"
                label={`${count} ${difficulty}`}
                sx={{
                  ...styles.difficultyChipBase,
                  bgcolor: alpha(
                    DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
                    0.1,
                  ),
                  color:
                    DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
                }}
              />
            ))}
          </Box>
        )}
      </Card.Content>

      <Card.Footer sx={styles.footer}>
        <Typography variant="caption" sx={styles.footerDate}>
          {formatRelativeTime(roadmap.createdAt)}
        </Typography>
        <LikeButton roadmapId={roadmap.id} compact />
      </Card.Footer>
    </Card>
  );
}
