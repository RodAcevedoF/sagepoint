"use client";

import { Box, Typography, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
import type { RoadmapProgressItem } from "../types/dashboard.types";

interface RoadmapProgressCardProps {
  item: RoadmapProgressItem;
  color: { main: string; light: string };
  index: number;
  onClick: (id: string) => void;
}

const styles = {
  itemTitle: {
    fontWeight: 500,
    fontSize: "0.875rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemMeta: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    bgcolor: alpha(palette.primary.light, 0.05),
  },
};

export function RoadmapProgressCard({
  item,
  color,
  index,
  onClick,
}: RoadmapProgressCardProps) {
  return (
    <Card
      variant="outlined"
      hoverable={false}
      onClick={() => onClick(item.id)}
      sx={{
        p: 1.5,
        height: "auto",
        cursor: "pointer",
        "&:hover": { bgcolor: alpha(palette.primary.light, 0.05) },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={styles.itemTitle}>{item.title}</Typography>
        <Typography
          sx={{ ...styles.itemMeta, color: color.light, fontWeight: 600 }}
        >
          {item.progressPercentage}%
        </Typography>
      </Box>

      <Box
        sx={{
          ...styles.progressBar,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${item.progressPercentage}%`,
            background: `linear-gradient(90deg, ${color.main}, ${color.light})`,
            borderRadius: 4,
            transformOrigin: "left",
            boxShadow: `0 0 10px ${alpha(color.main, 0.4)}`,
          }}
        />
      </Box>

      <Typography sx={{ ...styles.itemMeta, mt: 0.75 }}>
        {item.completedSteps}/{item.totalSteps} steps
      </Typography>
    </Card>
  );
}
