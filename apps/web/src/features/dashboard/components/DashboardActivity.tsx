"use client";

import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity } from "lucide-react";
import { Card, EmptyState } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { RecentRoadmapItem } from "../types/dashboard.types";
import { RoadmapActivityCard } from "./RoadmapActivityCard";

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
};

interface DashboardActivityProps {
  roadmaps: RecentRoadmapItem[];
  maxItems?: number;
  onRoadmapComplete?: () => void;
}

export function DashboardActivity({
  roadmaps,
  maxItems = 3,
  onRoadmapComplete,
}: DashboardActivityProps) {
  const router = useRouter();
  const visible = roadmaps.slice(0, maxItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <Box sx={styles.header}>
          <Typography variant="h6" sx={styles.title}>
            Recent Activity
          </Typography>
          <Box sx={styles.viewAll} onClick={() => router.push("/roadmaps")}>
            View all <ArrowRight size={14} />
          </Box>
        </Box>

        {visible.length === 0 ? (
          <EmptyState
            inline
            icon={Activity}
            title="No activity yet"
            description="Recently created roadmaps will appear here"
            actionLabel="Create roadmap"
            onAction={() => router.push("/roadmaps/create")}
          />
        ) : (
          <Stack
            spacing={2}
            sx={{ overflowY: "auto", overflowX: "hidden", flex: 1, p: 1 }}
          >
            {visible.map((item) => (
              <RoadmapActivityCard
                key={item.id}
                item={item}
                onClick={(id) => router.push(`/roadmaps/${id}`)}
                onComplete={onRoadmapComplete}
              />
            ))}
          </Stack>
        )}
      </Card>
    </motion.div>
  );
}
