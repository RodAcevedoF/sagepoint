"use client";

import { Box, Typography, SxProps, Theme } from "@mui/material";
import { Brand } from "../Brand";
import { TechStack } from "../TechStack";

const styles = {
  container: {
    mb: 2,
  },
  description: {
    maxWidth: 280,
    mt: 1.5,
  },
} satisfies Record<string, SxProps<Theme>>;

/**
 * FooterBrand component for the application footer.
 * Uses the unified Brand component without the logo, featuring
 * the distinct "Sage" and "Point" coloring.
 */
export function FooterBrand() {
  return (
    <Box sx={styles.container}>
      <Brand showLogo={false} fontSize="1.5rem" />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={styles.description}
      >
        AI-powered learning roadmaps from your own documents.
      </Typography>
      <TechStack />
    </Box>
  );
}
