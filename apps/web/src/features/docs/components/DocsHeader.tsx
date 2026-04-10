"use client";

import {
  Box,
  Typography,
  alpha,
  type SxProps,
  type Theme,
} from "@mui/material";
import { palette } from "@/shared/theme";

const styles = {
  container: {
    mb: 6,
    pb: 4,
    borderBottom: `1px solid ${alpha(palette.primary.light, 0.08)}`,
  } satisfies SxProps<Theme>,
  overline: {
    color: palette.primary.light,
    fontWeight: 600,
    letterSpacing: 1.5,
    fontSize: "0.75rem",
    mb: 1,
  } satisfies SxProps<Theme>,
  title: {
    fontWeight: 800,
    fontSize: { xs: "2rem", md: "2.75rem" },
    mb: 1.5,
    letterSpacing: "-0.02em",
  } satisfies SxProps<Theme>,
  subtitle: {
    color: alpha("#f5f5f5", 0.55),
    maxWidth: 560,
    fontWeight: 400,
    lineHeight: 1.7,
    fontSize: "1.05rem",
  } satisfies SxProps<Theme>,
};

export const DocsHeader = () => (
  <Box sx={styles.container}>
    <Typography variant="overline" sx={styles.overline}>
      DOCUMENTATION
    </Typography>
    <Typography variant="h2" component="h1" sx={styles.title}>
      Getting Started
    </Typography>
    <Typography variant="body1" sx={styles.subtitle}>
      Learn how to use Sagepoint to turn your documents into structured learning
      paths powered by AI and knowledge graphs.
    </Typography>
  </Box>
);
