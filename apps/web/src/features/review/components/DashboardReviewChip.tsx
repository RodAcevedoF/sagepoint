"use client";

import { Box, Chip, alpha, useTheme } from "@mui/material";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReviewCountQuery } from "@/application/review";

export function DashboardReviewChip() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useReviewCountQuery();
  const count = data?.count ?? 0;

  if (isLoading || count === 0) return null;

  return (
    <Box sx={{ display: "inline-flex" }}>
      <Chip
        icon={<Brain size={16} />}
        label={`${count} due to review`}
        clickable
        onClick={() => router.push("/review")}
        sx={{
          fontWeight: 600,
          color: theme.palette.info.light,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
          "& .MuiChip-icon": {
            color: theme.palette.info.light,
          },
          "&:hover": {
            bgcolor: alpha(theme.palette.info.main, 0.18),
          },
        }}
      />
    </Box>
  );
}
