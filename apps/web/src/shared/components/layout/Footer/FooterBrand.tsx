"use client";

import { Box, Typography, SxProps, Theme } from "@mui/material";
import { Brand } from "../../data-display/Brand";
import { TechStack } from "../../data-display/TechStack";

const styles: Record<string, SxProps<Theme>> = {
  container: {
    mb: 2,
  },
  description: {
    maxWidth: 280,
    mt: 1.5,
    color: "text.primary",
  },
};

export function FooterBrand() {
  return (
    <Box sx={styles.container}>
      <Brand showLogo={false} fontSize="1.5rem" href="/?stay=true" />
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
