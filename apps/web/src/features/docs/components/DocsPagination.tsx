"use client";

import React from "react";
import { Box, Typography, alpha, SxProps, Theme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { palette } from "@/common/theme";
import Link from "next/link";

/**
 * Styles for DocsPagination
 */
const paginationContainerStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: 3,
  mt: 8,
  pt: 4,
  borderTop: `1px solid ${alpha(palette.primary.light, 0.1)}`,
};

const baseLinkStyles: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: 3,
  borderRadius: 2,
  border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
  textDecoration: "none",
  transition: "all 0.2s ease-in-out",
  bgcolor: alpha(palette.background.paper, 0.4),
  "&:hover": {
    borderColor: palette.primary.light,
    bgcolor: alpha(palette.primary.main, 0.05),
    transform: "translateY(-2px)",
  },
};

const labelContainerStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  color: "text.disabled",
  mb: 1,
};

const labelTextStyles: SxProps<Theme> = {
  fontWeight: 600,
  textTransform: "uppercase",
};

const titleTextStyles: SxProps<Theme> = {
  color: palette.primary.light,
  fontWeight: 700,
};

interface PageLink {
  title: string;
  href: string;
}

interface DocsPaginationProps {
  prev?: PageLink;
  next?: PageLink;
}

export const DocsPagination = ({ prev, next }: DocsPaginationProps) => {
  return (
    <Box sx={paginationContainerStyles}>
      {prev ? (
        <Box
          component={Link}
          href={prev.href}
          sx={{
            ...baseLinkStyles,
            alignItems: "flex-start",
          }}
        >
          <Box sx={labelContainerStyles}>
            <ChevronLeft size={16} />
            <Typography variant="caption" sx={labelTextStyles}>
              Previous
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={titleTextStyles}>
            {prev.title}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}

      {next ? (
        <Box
          component={Link}
          href={next.href}
          sx={{
            ...baseLinkStyles,
            alignItems: "flex-end",
            textAlign: "right",
          }}
        >
          <Box sx={labelContainerStyles}>
            <Typography variant="caption" sx={labelTextStyles}>
              Next
            </Typography>
            <ChevronRight size={16} />
          </Box>
          <Typography variant="subtitle1" sx={titleTextStyles}>
            {next.title}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1 }} />
      )}
    </Box>
  );
};
