"use client";

import { Box, Typography, Grid } from "@mui/material";
import { Users, FileText, Map, Brain } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { AdminStatsDto } from "@/infrastructure/api/adminApi";

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

const statConfigs = [
  { key: "userCount" as const, label: "Total Users", icon: Users },
  { key: "documentCount" as const, label: "Total Documents", icon: FileText },
  { key: "roadmapCount" as const, label: "Total Roadmaps", icon: Map },
  { key: "quizCount" as const, label: "Total Quizzes", icon: Brain },
];

interface AdminStatsCardsProps {
  stats: AdminStatsDto;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statConfigs.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key];

        return (
          <Grid key={config.key} size={{ xs: 6, md: 3 }}>
            <Card variant="glass" hoverable={false} sx={styles.card}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Card.IconBox sx={{ width: 48, height: 48 }}>
                  <Icon size={24} />
                </Card.IconBox>
                <Box>
                  <Typography sx={styles.metricValue}>
                    {value}
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
