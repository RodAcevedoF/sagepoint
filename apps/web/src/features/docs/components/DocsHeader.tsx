"use client";

import { Box } from "@mui/material";
import { Sparkles } from "lucide-react";
import { aurora as auroraPalette } from "@/shared/theme";

const styles = {
  root: {
    mb: 6,
    pb: 4,
    borderBottom: `1px solid ${auroraPalette.line}`,
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "6px 13px",
    borderRadius: auroraPalette.radii.pill,
    background: `color-mix(in oklch, ${auroraPalette.teal} 10%, transparent)`,
    border: `1px solid color-mix(in oklch, ${auroraPalette.teal} 30%, transparent)`,
    color: auroraPalette.teal,
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: { xs: "2.25rem", md: "3rem" },
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
    margin: "18px 0 0",
    background: `linear-gradient(150deg, ${auroraPalette.txHi} 22%, ${auroraPalette.teal} 92%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    margin: "18px 0 0",
    maxWidth: "60ch",
    fontSize: { xs: "1rem", md: "1.075rem" },
    lineHeight: 1.65,
    color: auroraPalette.txMid,
    textWrap: "pretty",
  },
} as const;

export const DocsHeader = () => (
  <Box sx={styles.root}>
    <Box component="span" sx={styles.kicker}>
      <Sparkles size={13} />
      DOCUMENTATION
    </Box>
    <Box component="h1" sx={styles.title}>
      Getting Started
    </Box>
    <Box component="p" sx={styles.subtitle}>
      Learn how to use Sagepoint to turn your documents into structured learning
      paths powered by AI and knowledge graphs.
    </Box>
  </Box>
);
