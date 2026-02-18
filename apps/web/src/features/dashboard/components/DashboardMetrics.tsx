"use client";

import { Box, Typography, Grid } from "@mui/material";
import { Clock, BookCheck, Map, CheckCircle } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { UserMetrics } from "../types/dashboard.types";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
  },
  metricValue: {
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.2,
  },
  metricLabel: {
    color: palette.text.secondary,
    fontSize: "0.875rem",
  },
};

// ============================================================================
// Data
// ============================================================================

const metricConfigs = [
  {
    key: "totalHoursLearned",
    label: "Hours Learned",
    icon: Clock,
    format: (v: number) => `${v}h`,
  },
  {
    key: "topicsCompleted",
    label: "Topics Completed",
    icon: BookCheck,
    format: (v: number) => v.toString(),
  },
  {
    key: "activeRoadmaps",
    label: "Active Roadmaps",
    icon: Map,
    format: (v: number) => v.toString(),
  },
  {
    key: "totalStepsCompleted",
    label: "Steps Completed",
    icon: CheckCircle,
    format: (v: number) => v.toString(),
  },
] as const;

// ============================================================================
// Component
// ============================================================================

interface DashboardMetricsProps {
  metrics: UserMetrics;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metricConfigs.map((config) => {
        const Icon = config.icon;
        const value = metrics[config.key];

        return (
          <Grid key={config.key} size={{ xs: 6, md: 3 }}>
            <Card variant="glass" hoverable={false} sx={styles.card}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Card.IconBox sx={{ width: 48, height: 48 }}>
                  <Icon size={24} />
                </Card.IconBox>
                <Box>
                  <Typography sx={styles.metricValue}>
                    {config.format(value)}
                  </Typography>
                  <Typography sx={styles.metricLabel}>
                    {config.label}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
