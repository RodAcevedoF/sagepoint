"use client";

import { Box } from "@mui/material";
import { Sparkles } from "lucide-react";
import { aurora as auroraPalette } from "@/shared/theme";

interface BlogHeaderProps {
  title: string;
  subtitle: string;
  overline?: string;
}

const styles = {
  root: {
    textAlign: "center",
    maxWidth: 760,
    mx: "auto",
    mb: 8,
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    padding: "6px 13px",
    borderRadius: auroraPalette.radii.pill,
    background:
      "color-mix(in oklch, var(--ac, " +
      auroraPalette.teal +
      ") 10%, transparent)",
    border: `1px solid color-mix(in oklch, ${auroraPalette.teal} 30%, transparent)`,
    color: auroraPalette.teal,
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    marginTop: 3,
  },
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: { xs: "2.5rem", md: "3.75rem" },
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    margin: "20px 0 0",
    background: `linear-gradient(150deg, ${auroraPalette.txHi} 22%, ${auroraPalette.teal} 92%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    margin: "20px auto 0",
    maxWidth: "60ch",
    fontSize: { xs: "1rem", md: "1.125rem" },
    lineHeight: 1.65,
    color: auroraPalette.txMid,
    textWrap: "pretty",
  },
} as const;

export const BlogHeader = ({
  title,
  subtitle,
  overline = "AI features & updates",
}: BlogHeaderProps) => (
  <Box sx={styles.root}>
    <Box component="span" sx={styles.kicker}>
      <Sparkles size={13} />
      {overline}
    </Box>
    <Box component="h1" sx={styles.title}>
      {title}
    </Box>
    <Box component="p" sx={styles.subtitle}>
      {subtitle}
    </Box>
  </Box>
);
