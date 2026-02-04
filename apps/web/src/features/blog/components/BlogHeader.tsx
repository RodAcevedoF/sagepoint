"use client";

import React from "react";
import { Box, Typography, Stack, SxProps, Theme } from "@mui/material";
import { Sparkles } from "lucide-react";
import { palette } from "@/common/theme";

/**
 * Styles for BlogHeader
 */
const containerStyles: SxProps<Theme> = {
  mb: 8,
  textAlign: "center",
};

const overlineStyles: SxProps<Theme> = {
  color: palette.primary.light,
  fontWeight: 700,
  letterSpacing: 2,
};

const titleStyles: SxProps<Theme> = {
  fontWeight: 800,
  mb: 3,
  fontSize: { xs: "2.5rem", md: "3.75rem" },
};

const subtitleStyles: SxProps<Theme> = {
  color: "text.secondary",
  maxWidth: 700,
  mx: "auto",
  fontWeight: 400,
  lineHeight: 1.6,
};

interface BlogHeaderProps {
  title: string;
  subtitle: string;
  overline?: string;
}

export const BlogHeader = ({
  title,
  subtitle,
  overline = "AI FEATURES & UPDATES",
}: BlogHeaderProps) => {
  return (
    <Box sx={containerStyles}>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Sparkles size={24} color={palette.primary.light} />
        <Typography variant="overline" sx={overlineStyles}>
          {overline}
        </Typography>
      </Stack>
      <Typography variant="h2" component="h1" sx={titleStyles}>
        {title}
      </Typography>
      <Typography variant="h6" sx={subtitleStyles}>
        {subtitle}
      </Typography>
    </Box>
  );
};
