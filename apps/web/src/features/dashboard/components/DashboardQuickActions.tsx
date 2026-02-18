"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import { Plus, Map } from "lucide-react";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: 3,
  },
  title: {
    fontWeight: 600,
    mb: 2,
  },
  action: {
    p: 2.5,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    transition: "all 0.2s ease",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 2,
    flex: 1,
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.1),
      borderColor: palette.primary.light,
    },
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(palette.primary.main, 0.15),
    color: palette.primary.light,
    flexShrink: 0,
  },
};

// ============================================================================
// Component
// ============================================================================

export function DashboardQuickActions() {
  const router = useRouter();

  return (
    <Card variant="glass" hoverable={false} sx={styles.card}>
      <Typography variant="h6" sx={styles.title}>
        Quick Actions
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={styles.action} onClick={() => router.push("/roadmaps/create")}>
          <Box sx={styles.actionIcon}>
            <Plus size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Create Roadmap
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Generate a new learning path from a topic
            </Typography>
          </Box>
        </Box>
        <Box sx={styles.action} onClick={() => router.push("/roadmaps")}>
          <Box sx={styles.actionIcon}>
            <Map size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              View All Roadmaps
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Browse and continue your learning paths
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Card>
  );
}
