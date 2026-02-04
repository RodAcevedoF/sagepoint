"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { ProgressData } from "../types/dashboard.types";

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
  subtitle: {
    color: palette.text.secondary,
    fontSize: "0.875rem",
  },
  chartContainer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 160,
    gap: 1,
  },
  barWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    flex: 1,
    gap: 1,
  },
  bar: {
    width: "100%",
    borderRadius: 1,
    background: `linear-gradient(180deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
    transition: "height 0.3s ease",
  },
  barLabel: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
  },
  barValue: {
    color: palette.text.primary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardProgressProps {
  data: ProgressData[];
}

export function DashboardProgress({ data }: DashboardProgressProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Box sx={styles.header}>
        <Box>
          <Typography variant="h6" sx={styles.title}>
            Weekly Progress
          </Typography>
          <Typography sx={styles.subtitle}>
            {totalHours.toFixed(1)} hours this week
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.chartContainer}>
        {data.map((item) => {
          const heightPercent = (item.hours / maxHours) * 100;
          const isToday = item.day === new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);

          return (
            <Box key={item.day} sx={styles.barWrapper}>
              <Typography sx={styles.barValue}>
                {item.hours > 0 ? `${item.hours}h` : ""}
              </Typography>
              <Box
                sx={{
                  ...styles.bar,
                  height: `${Math.max(heightPercent, 4)}%`,
                  opacity: item.hours > 0 ? 1 : 0.2,
                  boxShadow: isToday
                    ? `0 0 12px ${alpha(palette.primary.light, 0.5)}`
                    : "none",
                }}
              />
              <Typography
                sx={{
                  ...styles.barLabel,
                  color: isToday ? palette.primary.light : palette.text.secondary,
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {item.day}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
