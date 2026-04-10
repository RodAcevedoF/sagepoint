"use client";

import { type ReactNode } from "react";
import {
  Box,
  Typography,
  alpha,
  type SxProps,
  type Theme,
} from "@mui/material";
import { palette } from "@/shared/theme";

const styles = {
  section: {
    mb: 6,
    scrollMarginTop: 100,
  } satisfies SxProps<Theme>,
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mb: 2,
  } satisfies SxProps<Theme>,
  icon: {
    color: palette.primary.light,
    display: "flex",
    flexShrink: 0,
  } satisfies SxProps<Theme>,
  title: {
    fontWeight: 700,
    fontSize: { xs: "1.35rem", md: "1.5rem" },
    letterSpacing: "-0.01em",
  } satisfies SxProps<Theme>,
  prose: {
    color: alpha("#f5f5f5", 0.7),
    lineHeight: 1.8,
    fontSize: "0.95rem",
    mb: 2.5,
    maxWidth: 680,
  } satisfies SxProps<Theme>,
  list: {
    listStyle: "none",
    p: 0,
    m: 0,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  } satisfies SxProps<Theme>,
  listItem: {
    color: alpha("#f5f5f5", 0.65),
    fontSize: "0.9rem",
    lineHeight: 1.7,
    display: "flex",
    alignItems: "baseline",
    gap: 1.5,
    "&::before": {
      content: '""',
      width: 5,
      height: 5,
      borderRadius: "50%",
      bgcolor: alpha(palette.primary.light, 0.4),
      flexShrink: 0,
      mt: "8px",
    },
  } satisfies SxProps<Theme>,
  divider: {
    mt: 6,
    borderBottom: `1px solid ${alpha(palette.primary.light, 0.06)}`,
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
  const color = variant === "tip" ? palette.success.main : palette.info.main;

  return (
    <Box
      sx={{
        p: 2.5,
        my: 2.5,
        borderRadius: 2,
        borderLeft: `3px solid ${color}`,
        bgcolor: alpha(color, 0.06),
        color: alpha("#f5f5f5", 0.75),
        fontSize: "0.9rem",
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
            bgcolor: alpha(palette.primary.light, 0.1),
            color: palette.primary.light,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
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
            sx={{ fontWeight: 600, color: "#f5f5f5", mb: 0.25 }}
          >
            {step.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: alpha("#f5f5f5", 0.6), lineHeight: 1.6 }}
          >
            {step.detail}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);
