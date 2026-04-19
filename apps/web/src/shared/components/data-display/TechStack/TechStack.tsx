"use client";

import { Box, Typography, alpha, SxProps, Theme } from "@mui/material";
import { palette } from "@/shared/theme";
import {
  Hub as GraphIcon,
  Psychology as LlmIcon,
  BubbleChart as VectorIcon,
} from "@mui/icons-material";

const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 3,
  },
  techItem: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: palette.primary.light,
    fontSize: "0.7rem",
    fontWeight: 600,
    bgcolor: alpha(palette.secondary.dark, 0.4),
    px: 1.2,
    py: 0.6,
    borderRadius: "6px",
    border: `1px solid ${alpha(palette.primary.dark, 0.6)}`,
    transition: "all 0.2s ease",
    cursor: "default",
    "&:hover": {
      bgcolor: alpha(palette.secondary.main, 0.2),
      borderColor: alpha(palette.primary.main, 0.8),
      transform: "translateY(-2px)",
    },
  },
};

export function TechStack() {
  const techItems = [
    { label: "Knowledge Graph", icon: <GraphIcon sx={{ fontSize: 16 }} /> },
    { label: "Vision Intel", icon: <VectorIcon sx={{ fontSize: 16 }} /> },
    { label: "LLM Agent", icon: <LlmIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={styles.container}>
      {techItems.map((item) => (
        <Box key={item.label} sx={styles.techItem}>
          {item.icon}
          <Typography
            variant="inherit"
            sx={{
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
              letterSpacing: "0.02em",
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
