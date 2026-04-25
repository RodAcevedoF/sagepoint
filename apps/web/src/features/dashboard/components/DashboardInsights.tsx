"use client";

import { Box, Typography, Stack, alpha, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { Sparkles, Clock, Timer, Flame, Layers } from "lucide-react";
import { Card, EmptyState } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { InsightsData } from "../types/dashboard.types";

const styles = {
  card: {
    p: 3,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: 3,
  },
  masteryBlock: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    mb: 3,
  },
  masteryValue: {
    fontWeight: 800,
    fontSize: "2.5rem",
    lineHeight: 1,
    background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.info.light})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  barTrack: {
    height: 14,
    borderRadius: 7,
    bgcolor: alpha(palette.primary.light, 0.08),
    overflow: "hidden",
    display: "flex",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  statCard: {
    p: 1.5,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.04),
    border: `1px solid ${alpha(palette.primary.light, 0.08)}`,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  statValue: {
    fontWeight: 700,
    fontSize: "1.1rem",
    lineHeight: 1.2,
    color: "text.primary",
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "text.secondary",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
};

const STAT_ICONS = [Clock, Flame, Timer, Layers] as const;
const STAT_COLORS = [
  palette.info.light,
  palette.warning.light,
  palette.success.light,
  palette.primary.light,
];

interface DashboardInsightsProps {
  data: InsightsData;
  overallProgress: number;
}

export function DashboardInsights({
  data,
  overallProgress,
}: DashboardInsightsProps) {
  const {
    difficultyBreakdown,
    avgMinutesPerStep,
    hoursInvested,
    hoursRemaining,
    totalSteps,
  } = data;

  const stats = [
    {
      label: "Hours invested",
      value: `${hoursInvested}h`,
      Icon: STAT_ICONS[0],
      color: STAT_COLORS[0],
    },
    {
      label: "Hours remaining",
      value: `${hoursRemaining}h`,
      Icon: STAT_ICONS[2],
      color: STAT_COLORS[2],
    },
    {
      label: "Avg min / step",
      value: `${avgMinutesPerStep}m`,
      Icon: STAT_ICONS[1],
      color: STAT_COLORS[1],
    },
    {
      label: "Total steps",
      value: totalSteps.toString(),
      Icon: STAT_ICONS[3],
      color: STAT_COLORS[3],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4, ease: "easeOut" }}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <Box sx={styles.header}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Learning Insights
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your pace and mastery
            </Typography>
          </Box>
          <Sparkles size={18} color={palette.primary.light} />
        </Box>

        {totalSteps === 0 ? (
          <EmptyState
            inline
            icon={Sparkles}
            title="No insights yet"
            description="Complete a few steps to unlock pace and mastery stats"
          />
        ) : (
          <>
            {/* Mastery */}
            <Box sx={styles.masteryBlock}>
              <Typography sx={styles.masteryValue}>
                {overallProgress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of all steps mastered
              </Typography>
            </Box>

            {/* Difficulty stacked bar */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontSize: "0.65rem",
              }}
            >
              Difficulty mix
            </Typography>
            <Box sx={styles.barTrack}>
              {difficultyBreakdown.map((seg, i) => {
                const pct = (seg.count / totalSteps) * 100;
                return (
                  <Tooltip
                    key={seg.name}
                    title={`${seg.name}: ${seg.count} steps (${Math.round(pct)}%)`}
                    arrow
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.5 + i * 0.07,
                        ease: "easeOut",
                      }}
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: seg.color,
                        transformOrigin: "left",
                        cursor: "default",
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>

            {/* Legend */}
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1.5}
              sx={{ mt: 1.5, mb: 3 }}
            >
              {difficultyBreakdown.map((seg) => (
                <Box
                  key={seg.name}
                  sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <Box sx={{ ...styles.legendDot, bgcolor: seg.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {seg.name}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Pace stats 2×2 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
                mt: "auto",
              }}
            >
              {stats.map(({ label, value, Icon, color }) => (
                <Box key={label} sx={styles.statCard}>
                  <Icon size={16} color={color} />
                  <Box>
                    <Typography sx={styles.statValue}>{value}</Typography>
                    <Typography sx={styles.statLabel}>{label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Card>
    </motion.div>
  );
}
