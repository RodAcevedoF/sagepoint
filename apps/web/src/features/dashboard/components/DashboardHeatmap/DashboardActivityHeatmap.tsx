"use client";

import { useEffect, useRef } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Card } from "@/shared/components";
import { useUserActivityQuery } from "@/application/roadmap/queries/get-user-activity.query";
import { DAYS, type StatKey } from "./constants";
import { styles } from "./styles";
import { buildGrid, getMonthLabels } from "./utils";
import { HeatmapStats } from "./HeatmapStats";
import { HeatmapGrid } from "./HeatmapGrid";
import { HeatmapLegend } from "./HeatmapLegend";

export function DashboardActivityHeatmap() {
  const { data, isLoading } = useUserActivityQuery(DAYS);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [isMobile, data]);

  if (isLoading || !data) {
    return (
      <Card sx={styles.card}>
        <Box sx={styles.loading}>
          <Typography sx={styles.loadingText}>Loading activity…</Typography>
        </Box>
      </Card>
    );
  }

  const totalSteps = data.days.reduce((s, d) => s + d.count, 0);
  const { grid, cols, startOffset } = buildGrid(data.days);
  const monthLabels = getMonthLabels(data.days, startOffset, cols);

  const statValues: Record<StatKey, number> = {
    current: data.currentStreak,
    longest: data.longestStreak,
    total30: data.totalLast30,
  };

  return (
    <Card sx={styles.card}>
      <Box sx={styles.header}>
        <Box>
          <Typography sx={styles.title}>Activity</Typography>
          <Typography sx={styles.subtitle}>Last year</Typography>
        </Box>
        <HeatmapStats values={statValues} />
      </Box>

      <HeatmapGrid
        ref={scrollRef}
        grid={grid}
        cols={cols}
        monthLabels={monthLabels}
      />

      <HeatmapLegend totalSteps={totalSteps} />
    </Card>
  );
}
