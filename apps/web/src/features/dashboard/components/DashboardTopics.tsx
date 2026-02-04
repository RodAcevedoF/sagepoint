"use client";

import { Box, Typography, Stack } from "@mui/material";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { TopicDistribution } from "../types/dashboard.types";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
    height: "100%",
  },
  title: {
    fontWeight: 600,
    mb: 3,
  },
  ringContainer: {
    position: "relative" as const,
    width: 160,
    height: 160,
    mx: "auto",
    mb: 3,
  },
  centerText: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center" as const,
  },
  centerValue: {
    fontWeight: 700,
    fontSize: "1.5rem",
    lineHeight: 1,
  },
  centerLabel: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    mr: 1.5,
  },
  legendLabel: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  legendValue: {
    fontWeight: 600,
    fontSize: "0.875rem",
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardTopicsProps {
  distribution: TopicDistribution[];
}

export function DashboardTopics({ distribution }: DashboardTopicsProps) {
  const total = distribution.reduce((sum, d) => sum + d.value, 0);

  // Calculate SVG ring segments
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Typography variant="h6" sx={styles.title}>
        Topic Distribution
      </Typography>

      <Box sx={styles.ringContainer}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {distribution.map((topic, index) => {
            const segmentLength = (topic.value / total) * circumference;
            const offset = distribution
              .slice(0, index)
              .reduce((sum, d) => sum + (d.value / total) * circumference, 0);

            return (
              <circle
                key={topic.name}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={topic.color}
                strokeWidth="16"
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dasharray 0.3s ease" }}
              />
            );
          })}
        </svg>
        <Box sx={styles.centerText}>
          <Typography sx={styles.centerValue}>{total}%</Typography>
          <Typography sx={styles.centerLabel}>Complete</Typography>
        </Box>
      </Box>

      <Stack spacing={1.5}>
        {distribution.map((topic) => (
          <Box key={topic.name} sx={styles.legendItem}>
            <Box sx={styles.legendLabel}>
              <Box sx={{ ...styles.legendDot, bgcolor: topic.color }} />
              <Typography variant="body2">{topic.name}</Typography>
            </Box>
            <Typography sx={styles.legendValue}>{topic.value}%</Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
