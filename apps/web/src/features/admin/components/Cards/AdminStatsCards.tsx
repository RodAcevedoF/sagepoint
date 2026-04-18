"use client";

import { Box, Typography, Grid, alpha } from "@mui/material";
import { Users, FileText, Map, Brain, TrendingUp } from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import { motion } from "framer-motion";
import type { AdminStatsDto } from "@/infrastructure/api/adminApi";

const styles = {
  card: {
    p: { xs: 2, sm: 3 },
    height: "100%",
  },
  metricValue: {
    fontWeight: 800,
    fontSize: { xs: "1.5rem", sm: "2.25rem" },
    lineHeight: 1.1,
    mb: 0.5,
  },
  metricLabel: {
    color: palette.text.secondary,
    fontSize: { xs: "0.75rem", sm: "0.9rem" },
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
};

const statConfigs = [
  {
    key: "userCount" as const,
    label: "Users",
    icon: Users,
    color: palette.info.main,
  },
  {
    key: "documentCount" as const,
    label: "Docs",
    icon: FileText,
    color: palette.secondary.light,
  },
  {
    key: "roadmapCount" as const,
    label: "Paths",
    icon: Map,
    color: palette.primary.main,
  },
  {
    key: "quizCount" as const,
    label: "Tests",
    icon: Brain,
    color: palette.warning.main,
  },
];

interface AdminStatsCardsProps {
  stats: AdminStatsDto;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 5 }}>
      {statConfigs.map((config, index) => {
        const Icon = config.icon;
        const value = stats[config.key];

        return (
          <Grid key={config.key} size={{ xs: 6, sm: 6, md: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="glass" hoverable={true} sx={styles.card}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, sm: 52 },
                      height: { xs: 40, sm: 52 },
                      borderRadius: { xs: 2, sm: 3 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(config.color, 0.12),
                      color: config.color,
                      border: `1px solid ${alpha(config.color, 0.2)}`,
                    }}
                  >
                    <Icon size={22} />
                  </Box>
                  <Box>
                    <Typography sx={styles.metricLabel}>
                      {config.label}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 1.5,
                      }}
                    >
                      <Typography sx={styles.metricValue}>{value}</Typography>
                      <Box
                        sx={{
                          color: palette.success.main,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          mb: 0.8,
                        }}
                      >
                        <TrendingUp size={14} />
                      </Box>
                    </Box>
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
