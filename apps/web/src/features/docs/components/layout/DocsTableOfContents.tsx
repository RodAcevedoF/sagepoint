"use client";

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { palette } from "@/common/theme";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
}

/**
 * Styles for DocsTableOfContents
 */
const tocContainerStyles: SxProps<Theme> = {
  position: "sticky",
  top: 100,
  height: "fit-content",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  pl: 3,
  borderLeft: `1px solid ${alpha(palette.primary.light, 0.1)}`,
};

const tocTitleStyles: SxProps<Theme> = {
  color: "text.disabled",
  fontWeight: 700,
  letterSpacing: 1.2,
  mb: 2,
  display: "block",
};

const getListItemButtonStyles = (level: number): SxProps<Theme> => ({
  py: 0.5,
  px: 0,
  pl: (level - 2) * 2, // Indent based on heading level (h2, h3, etc)
  borderRadius: 1,
  transition: "all 0.2s",
  "&:hover": {
    bgcolor: "transparent",
    color: palette.primary.light,
  },
});

const getListItemTextProps = (isActive: boolean) => ({
  variant: "body2" as const,
  fontSize: "0.875rem",
  fontWeight: isActive ? 600 : 400,
  color: isActive ? palette.primary.light : "text.secondary",
  sx: {
    transition: "color 0.2s",
    borderLeft: isActive
      ? `2px solid ${palette.primary.light}`
      : "2px solid transparent",
    pl: 2,
    ml: -2.1, // Offset the border to sit on the container line
  },
});

export const DocsTableOfContents = ({
  items,
  activeId,
}: DocsTableOfContentsProps) => {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={tocContainerStyles}>
      <Typography variant="overline" sx={tocTitleStyles}>
        On This Page
      </Typography>

      <List disablePadding>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component="a"
                href={`#${item.id}`}
                sx={getListItemButtonStyles(item.level)}
              >
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={getListItemTextProps(isActive)}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
