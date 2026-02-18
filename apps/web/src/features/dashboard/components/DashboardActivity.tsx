"use client";

import { Box, Typography, LinearProgress, Stack, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { Map, ArrowRight } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
    height: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
  },
  title: {
    fontWeight: 600,
  },
  viewAll: {
    color: palette.primary.light,
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  activityItem: {
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.1),
      borderColor: palette.primary.light,
    },
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
  },
  progress: {
    height: 4,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
    },
  },
  stepCount: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
    mt: 0.5,
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardActivityProps {
  roadmaps: UserRoadmapDto[];
}

export function DashboardActivity({ roadmaps }: DashboardActivityProps) {
  const router = useRouter();

  const recentRoadmaps = [...roadmaps]
    .sort((a, b) => new Date(b.roadmap.createdAt).getTime() - new Date(a.roadmap.createdAt).getTime())
    .slice(0, 3);

  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          Recent Roadmaps
        </Typography>
        <Typography
          sx={styles.viewAll}
          onClick={() => router.push("/roadmaps")}
        >
          View all <ArrowRight size={14} />
        </Typography>
      </Box>

      <Stack spacing={2}>
        {recentRoadmaps.map(({ roadmap, progress }) => (
          <Box
            key={roadmap.id}
            sx={styles.activityItem}
            onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={styles.activityIcon}>
                <Map size={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {roadmap.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeDate(roadmap.createdAt)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress.progressPercentage}
                    sx={styles.progress}
                  />
                </Box>
                <Typography sx={styles.stepCount}>
                  {progress.completedSteps}/{progress.totalSteps} steps completed
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
