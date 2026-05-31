"use client";

import { type ReactNode } from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

const styles = {
  section: {
    mb: 6,
    scrollMarginTop: 100,
  } satisfies SxProps<Theme>,
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mb: 2.5,
  } satisfies SxProps<Theme>,
  icon: {
    color: auroraPalette.teal,
    display: "flex",
    flexShrink: 0,
  } satisfies SxProps<Theme>,
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 700,
    fontSize: { xs: "1.4rem", md: "1.625rem" },
    letterSpacing: "-0.015em",
    color: auroraPalette.txHi,
  } satisfies SxProps<Theme>,
  prose: {
    color: auroraPalette.tx,
    lineHeight: 1.75,
    fontSize: "1rem",
    mb: 2.5,
    maxWidth: 680,
  } satisfies SxProps<Theme>,
  list: {
    listStyle: "none",
    p: 0,
    m: 0,
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
  } satisfies SxProps<Theme>,
  listItem: {
    color: auroraPalette.tx,
    fontSize: "0.95rem",
    lineHeight: 1.7,
    display: "flex",
    alignItems: "baseline",
    gap: 1.5,
    "&::before": {
      content: '""',
      width: 5,
      height: 5,
      borderRadius: "50%",
      bgcolor: auroraTint(auroraPalette.teal, 0.55),
      flexShrink: 0,
      mt: "8px",
    },
  } satisfies SxProps<Theme>,
  divider: {
    mt: 6,
    borderBottom: `1px solid ${auroraPalette.line}`,
  } satisfies SxProps<Theme>,
};

interface DocsSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  showDivider?: boolean;
}

export const DocsSection = ({
  id,
  icon,
  title,
  children,
  showDivider = true,
}: DocsSectionProps) => (
  <Box id={id} sx={styles.section}>
    <Box sx={styles.titleRow}>
      <Box sx={styles.icon}>{icon}</Box>
      <Typography variant="h5" component="h2" sx={styles.title}>
        {title}
      </Typography>
    </Box>
    {children}
    {showDivider && <Box sx={styles.divider} />}
  </Box>
);

export const DocsProse = ({ children }: { children: ReactNode }) => (
  <Typography variant="body1" sx={styles.prose}>
    {children}
  </Typography>
);

export const DocsList = ({ items }: { items: string[] }) => (
  <Box component="ul" sx={styles.list}>
    {items.map((item, i) => (
      <Box component="li" key={i} sx={styles.listItem}>
        {item}
      </Box>
    ))}
  </Box>
);

interface DocsCalloutProps {
  children: ReactNode;
  variant?: "info" | "tip";
}

export const DocsCallout = ({
  children,
  variant = "info",
}: DocsCalloutProps) => {
  const accent =
    variant === "tip" ? auroraPalette.teal : auroraPalette.status.concept;

  return (
    <Box
      sx={{
        p: 2.5,
        my: 2.5,
        borderRadius: auroraPalette.radii.md,
        borderLeft: `3px solid ${accent}`,
        bgcolor: auroraTint(accent, 0.08),
        color: auroraPalette.tx,
        fontSize: "0.95rem",
        lineHeight: 1.7,
      }}
    >
      {children}
    </Box>
  );
};

interface DocsStepsProps {
  steps: { label: string; detail: string }[];
}

export const DocsSteps = ({ steps }: DocsStepsProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
    {steps.map((step, i) => (
      <Box key={i} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: auroraTint(auroraPalette.teal, 0.14),
            border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
            color: auroraPalette.teal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: auroraPalette.font.mono,
            fontSize: "0.78rem",
            fontWeight: 700,
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          {i + 1}
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: auroraPalette.txHi,
              mb: 0.35,
              fontSize: "0.975rem",
            }}
          >
            {step.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: auroraPalette.txMid,
              lineHeight: 1.65,
              fontSize: "0.9rem",
            }}
          >
            {step.detail}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);
