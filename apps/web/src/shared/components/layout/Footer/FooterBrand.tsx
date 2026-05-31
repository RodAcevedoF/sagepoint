"use client";

import { Box } from "@mui/material";
import { Brand } from "../../data-display/Brand";
import { TechStack } from "../../data-display/TechStack";
import { aurora as auroraPalette } from "@/shared/theme";

const styles = {
  tagline: {
    margin: "18px 0 0",
    fontSize: "14.5px",
    lineHeight: 1.6,
    color: auroraPalette.txMid,
    maxWidth: "34ch",
  },
} as const;

export function FooterBrand() {
  return (
    <Box>
      <Brand showLogo={false} fontSize="1.5rem" href="/?stay=true" />
      <Box component="p" sx={styles.tagline}>
        AI-powered learning roadmaps from your own documents.
      </Box>
      <TechStack />
    </Box>
  );
}
