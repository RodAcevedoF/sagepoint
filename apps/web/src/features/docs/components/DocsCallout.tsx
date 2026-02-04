"use client";

import React from "react";
import { Box, Typography, alpha, SxProps, Theme } from "@mui/material";
import { Info, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { palette } from "@/common/theme";

export type CalloutType = "info" | "warning" | "error" | "success" | "tip";

interface DocsCalloutProps {
  id?: string;
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

/**
 * Style constants and generators for DocsCallout
 */
const getContainerStyles = (bg: string, color: string): SxProps<Theme> => ({
  p: 3,
  my: 4,
  bgcolor: bg,
  borderRadius: 2,
  borderLeft: `4px solid ${color}`,
  display: "flex",
  gap: 2,
});

const getIconBoxStyles = (color: string): SxProps<Theme> => ({
  color: color,
  mt: 0.5,
  flexShrink: 0,
});

const getTitleStyles = (color: string): SxProps<Theme> => ({
  color: color,
  fontWeight: 700,
  mb: 0.5,
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

const bodyStyles: SxProps<Theme> = {
  color: "text.primary",
  lineHeight: 1.6,
};

const getCalloutConfig = (type: CalloutType) => {
  switch (type) {
    case "warning":
      return {
        color: "#ff9800",
        bg: alpha("#ff9800", 0.1),
        icon: <AlertTriangle size={20} />,
      };
    case "error":
      return {
        color: "#f44336",
        bg: alpha("#f44336", 0.1),
        icon: <AlertCircle size={20} />,
      };
    case "success":
      return {
        color: "#4caf50",
        bg: alpha("#4caf50", 0.1),
        icon: <CheckCircle2 size={20} />,
      };
    case "tip":
      return {
        color: palette.primary.light,
        bg: alpha(palette.primary.main, 0.1),
        icon: <Info size={20} />,
      };
    case "info":
    default:
      return {
        color: "#03a9f4",
        bg: alpha("#03a9f4", 0.1),
        icon: <Info size={20} />,
      };
  }
};

export const DocsCallout = ({
  id,
  type = "info",
  title,
  children,
}: DocsCalloutProps) => {
  const config = getCalloutConfig(type);

  return (
    <Box id={id} sx={getContainerStyles(config.bg, config.color)}>
      <Box sx={getIconBoxStyles(config.color)}>{config.icon}</Box>
      <Box>
        {title && (
          <Typography variant="subtitle2" sx={getTitleStyles(config.color)}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" sx={bodyStyles}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
};
