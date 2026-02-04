"use client";

import { Box, Typography, LinearProgress, Stack, alpha } from "@mui/material";
import { BookOpen, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";
import type { RecentActivity } from "../types/dashboard.types";

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
  viewAll: {
    color: palette.primary.light,
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
  activityItem: {
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.1),
      borderColor: palette.primary.light,
    },
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
  },
  progress: {
    height: 4,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.1),
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
    },
  },
  category: {
    px: 1,
    py: 0.25,
    borderRadius: 1,
    bgcolor: alpha(palette.primary.light, 0.1),
    color: palette.primary.light,
    fontSize: "0.7rem",
    fontWeight: 500,
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardActivityProps {
  activities: RecentActivity[];
}

export function DashboardActivity({ activities }: DashboardActivityProps) {
  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Box sx={styles.header}>
        <Typography variant="h6" sx={styles.title}>
          Recent Activity
        </Typography>
        <Typography sx={styles.viewAll}>
          View all <ArrowRight size={14} />
        </Typography>
      </Box>

      <Stack spacing={2}>
        {activities.map((activity) => {
          const Icon = activity.type === "topic" ? BookOpen : FileText;

          return (
            <Box key={activity.id} sx={styles.activityItem}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={styles.activityIcon}>
                  <Icon size={20} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      noWrap
                      sx={{ flex: 1 }}
                    >
                      {activity.title}
                    </Typography>
                    <Typography component="span" sx={styles.category}>
                      {activity.category}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.timestamp}
                  </Typography>
                  {activity.progress !== undefined && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={activity.progress}
                        sx={styles.progress}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
