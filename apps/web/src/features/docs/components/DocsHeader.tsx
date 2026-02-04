"use client";

import React from "react";
import { Box, Typography, Divider, alpha, SxProps, Theme } from "@mui/material";
import { palette } from "@/common/theme";

interface DocsHeaderProps {
  title: string;
  description?: string;
  showDivider?: boolean;
}

/**
 * Styles for DocsHeader
 */
const containerStyles: SxProps<Theme> = {
  mb: 6,
};

const titleStyles: SxProps<Theme> = {
  fontWeight: 800,
  background: `linear-gradient(45deg, ${palette.primary.light} 30%, ${palette.primary.main} 90%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  mb: 2,
};

const getDescriptionStyles = (showDivider: boolean): SxProps<Theme> => ({
  color: "text.secondary",
  fontWeight: 400,
  lineHeight: 1.6,
  mb: showDivider ? 4 : 0,
  maxWidth: "800px",
});

const dividerStyles: SxProps<Theme> = {
  borderColor: alpha(palette.primary.light, 0.1),
  borderWidth: "1px",
};

export const DocsHeader = ({
  title,
  description,
  showDivider = true,
}: DocsHeaderProps) => {
  return (
    <Box sx={containerStyles}>
      <Typography variant="h3" component="h1" gutterBottom sx={titleStyles}>
        {title}
      </Typography>

      {description && (
        <Typography variant="h6" sx={getDescriptionStyles(showDivider)}>
          {description}
        </Typography>
      )}

      {showDivider && <Divider sx={dividerStyles} />}
    </Box>
  );
};
