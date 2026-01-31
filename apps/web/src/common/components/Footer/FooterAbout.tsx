"use client";

import { Box, Typography, alpha } from "@mui/material";
import { palette } from "@/common/theme";
import {
  Memory as TechIcon,
  Storage as DbIcon,
  AutoAwesome as AiIcon,
} from "@mui/icons-material";

const styles = {
  columnTitle: {
    color: "text.primary",
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    mb: 2.5,
  },
  description: {
    maxWidth: 320,
    color: "text.secondary",
    lineHeight: 1.7,
    fontSize: "0.875rem",
    mb: 3,
  },
  techStack: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
  },
  techItem: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: palette.primary.light,
    fontSize: "0.7rem",
    fontWeight: 600,
    bgcolor: alpha(palette.primary.main, 0.08),
    px: 1.2,
    py: 0.6,
    borderRadius: "6px",
    border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
    transition: "all 0.2s ease",
    cursor: "default",
    "&:hover": {
      bgcolor: alpha(palette.primary.main, 0.12),
      borderColor: alpha(palette.primary.light, 0.3),
      transform: "translateY(-2px)",
    },
  },
};

export function FooterAbout() {
  const techItems = [
    { label: "Next.js 15", icon: <TechIcon sx={{ fontSize: 16 }} /> },
    { label: "Neo4j Graph", icon: <DbIcon sx={{ fontSize: 16 }} /> },
    { label: "LLM Agent", icon: <AiIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box>
      <Typography variant="overline" sx={styles.columnTitle} component="h3">
        Academic Project
      </Typography>
      <Typography variant="body2" sx={styles.description}>
        SagePoint is a Bachelor&apos;s Thesis (TFG) exploring the frontier of
        personalized education. We combine Clean Architecture with Graph-RAG to
        transform documents into intelligent learning journeys.
      </Typography>

      <Box sx={styles.techStack}>
        {techItems.map((item) => (
          <Box key={item.label} sx={styles.techItem}>
            {item.icon}
            <Typography variant="inherit" sx={{ whiteSpace: "nowrap" }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
