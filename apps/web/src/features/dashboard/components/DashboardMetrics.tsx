"use client";

import { Box, Typography, Grid, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { Clock, BookCheck, Map, CheckCircle } from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { UserMetrics } from "../types/dashboard.types";

const styles = {
  card: {
    py: 3,
    px: { xs: 1.5, md: 3 },
  },
  iconBox: {
    width: { xs: 40, md: 48 },
    height: { xs: 40, md: 48 },
    "& svg": {
      width: { xs: 24, md: 32 },
      height: { xs: 24, md: 32 },
    },
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

const metricConfigs = [
  {
    key: "totalHoursLearned",
    label: "Hours Learned",
    icon: Clock,
    format: (v: number) => `${v}h`,
    color: palette.info.main,
    lightColor: palette.info.light,
  },
  {
    key: "topicsCompleted",
    label: "Topics Completed",
    icon: BookCheck,
    format: (v: number) => v.toString(),
    color: palette.success.main,
    lightColor: palette.success.light,
  },
  {
    key: "activeRoadmaps",
    label: "Active Roadmaps",
    icon: Map,
    format: (v: number) => v.toString(),
    color: palette.warning.main,
    lightColor: palette.warning.light,
  },
  {
    key: "totalStepsCompleted",
    label: "Steps Completed",
    icon: CheckCircle,
    format: (v: number) => v.toString(),
    color: palette.primary.main,
    lightColor: palette.primary.light,
  },
] as const;

interface DashboardMetricsProps {
  metrics: UserMetrics;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metricConfigs.map((config, index) => {
        const Icon = config.icon;
        const value = metrics[config.key];

        return (
          <Grid key={config.key} size={{ xs: 6, md: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: "easeOut",
              }}
            >
              <Card
                variant="glass"
                hoverable={false}
                sx={{
                  ...styles.card,
                  borderColor: alpha(config.color, 0.1),
                  "&:hover": {
                    borderColor: alpha(config.color, 0.2),
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Card.IconBox
                    sx={{
                      ...styles.iconBox,
                      bgcolor: alpha(config.color, 0.1),
                      color: config.lightColor,
                    }}
                  >
                    <Icon size={32} />
                  </Card.IconBox>
                  <Box>
                    <Typography
                      sx={{
                        ...styles.metricValue,
                        color: config.lightColor,
                      }}
                    >
                      {config.format(value)}
                    </Typography>
                    <Typography sx={styles.metricLabel}>
                      {config.label}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
}
