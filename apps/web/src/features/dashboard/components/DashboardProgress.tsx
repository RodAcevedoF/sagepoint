"use client";

import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { RoadmapProgressItem } from "../types/dashboard.types";
import { RoadmapProgressCard } from "./RoadmapProgressCard";

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
};

const PROGRESS_COLORS = [
  { main: palette.primary.main, light: palette.primary.light },
  { main: palette.warning.main, light: palette.warning.light },
  { main: palette.info.main, light: palette.info.light },
  { main: palette.success.main, light: palette.success.light },
  { main: palette.error.main, light: palette.error.light },
];

const MAX_ITEMS = 3;

interface DashboardProgressProps {
  data: RoadmapProgressItem[];
}

export function DashboardProgress({ data }: DashboardProgressProps) {
  const router = useRouter();
  const visible = data.slice(0, MAX_ITEMS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <Box sx={styles.header}>
          <Box>
            <Typography variant="h6" sx={styles.title}>
              Roadmap Progress
            </Typography>
            <Typography sx={styles.subtitle}>
              {data.length} roadmap{data.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Stack
          spacing={2}
          sx={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}
        >
          {visible.map((item, index) => (
            <RoadmapProgressCard
              key={item.id}
              item={item}
              color={PROGRESS_COLORS[index % PROGRESS_COLORS.length]}
              index={index}
              onClick={(id) => router.push(`/roadmaps/${id}`)}
            />
          ))}
        </Stack>
      </Card>
    </motion.div>
  );
}
