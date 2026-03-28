"use client";

import { Box, Typography, LinearProgress, Stack, alpha } from "@mui/material";
import { Map } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { RecentRoadmapItem } from "../types/dashboard.types";
import { formatRelativeDate } from "../utils/dashboard.utils";

interface RoadmapActivityCardProps {
  item: RecentRoadmapItem;
  onClick: (id: string) => void;
}

const styles = {
  activityItem: {
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    cursor: "pointer",
    width: "100%",
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
    flexShrink: 0,
    border: `1px solid ${alpha(palette.primary.light, 0.2)}`,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    bgcolor: alpha(palette.primary.light, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 3,
      background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
    },
  },
  stepCount: {
    color: palette.text.secondary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
};

export function RoadmapActivityCard({
  item,
  onClick,
}: RoadmapActivityCardProps) {
  return (
    <Card
      variant="outlined"
      hoverable={true}
      onClick={() => onClick(item.id)}
      sx={{
        p: 2,
        height: "auto",
        "&:hover": {
          bgcolor: alpha(palette.primary.light, 0.05),
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={styles.activityIcon}>
          <Map size={24} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              noWrap
              sx={{ maxWidth: "70%", color: palette.text.primary }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: palette.text.secondary, fontWeight: 500 }}
            >
              {formatRelativeDate(item.createdAt)}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <LinearProgress
              variant="determinate"
              value={item.progressPercentage}
              sx={styles.progress}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={styles.stepCount}>
                {item.completedSteps}/{item.totalSteps} steps
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color="primary.light"
              >
                {Math.round(item.progressPercentage)}%
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
