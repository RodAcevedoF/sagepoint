"use client";

import React, { ReactNode } from "react";
import { Paper, Box, alpha, SxProps, Theme } from "@mui/material";
import { palette } from "@/common/theme";

/**
 * Composition-based Card component designed for high reusability across the app.
 * Follows the Compound Component pattern to allow flexible layouts.
 */

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  variant?: "glass" | "outlined" | "solid";
  hoverable?: boolean;
}

const getVariantStyles = (variant: CardProps["variant"]) => {
  switch (variant) {
    case "glass":
      return {
        background: alpha(palette.background.paper, 0.4),
        backdropFilter: "blur(12px)",
        border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
      };
    case "outlined":
      return {
        bgcolor: "transparent",
        border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
      };
    case "solid":
      return {
        bgcolor: palette.background.paper,
        border: `1px solid ${alpha(palette.divider, 1)}`,
      };
    default:
      return {};
  }
};

export function Card({
  children,
  onClick,
  sx,
  variant = "glass",
  hoverable = true,
}: CardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          borderRadius: 6,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: onClick ? "pointer" : "default",
          ...getVariantStyles(variant),
        },
        hoverable && {
          "&:hover": {
            transform: "translateY(-8px)",
            borderColor: alpha(palette.primary.light, 0.4),
            boxShadow: `0 20px 40px ${alpha(palette.primary.main, 0.15)}`,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Paper>
  );
}

/**
 * Card.Header: Optional section for icons, badges or titles
 */
Card.Header = function CardHeader({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          p: { xs: 3, md: 4 },
          pb: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

/**
 * Card.Content: Main body of the card
 */
Card.Content = function CardContent({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          p: { xs: 3, md: 4 },
          flexGrow: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

/**
 * Card.Footer: Bottom action area
 */
Card.Footer = function CardFooter({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          p: { xs: 2, md: 3 },
          pt: 0,
          mt: "auto",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

/**
 * Card.IconBox: Helper to wrap icons with standard styling
 */
Card.IconBox = function CardIconBox({
  children,
  sx,
  active = false,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  active?: boolean;
}) {
  return (
    <Box
      className="card-icon-box"
      sx={[
        {
          width: 56,
          height: 56,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: active
            ? alpha(palette.primary.main, 0.2)
            : alpha(palette.primary.main, 0.1),
          color: palette.primary.light,
          transition: "all 0.3s ease",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};
