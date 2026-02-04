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

interface NavSection {
  title: string;
  items: string[];
}

interface DocsSidebarProps {
  sections: NavSection[];
  activeItem?: string;
}

/**
 * Styles for DocsSidebar
 */
const sidebarContainerStyles: SxProps<Theme> = {
  position: "sticky",
  top: 100,
  height: "calc(100vh - 120px)",
  overflowY: "auto",
  pr: 2,
  /* Custom Scrollbar Styling */
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(palette.primary.light, 0.1),
    borderRadius: "10px",
    transition: "background 0.2s",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    background: alpha(palette.primary.light, 0.2),
  },
};

const sectionTitleStyles: SxProps<Theme> = {
  color: palette.primary.light,
  fontWeight: 700,
  letterSpacing: 1.2,
  px: 2,
  mb: 1,
  display: "block",
};

const getListItemButtonStyles = (isActive: boolean): SxProps<Theme> => ({
  borderRadius: 1,
  transition: "all 0.2s",
  bgcolor: isActive ? alpha(palette.primary.main, 0.08) : "transparent",
  "&:hover": {
    bgcolor: alpha(palette.primary.main, 0.12),
    color: palette.primary.light,
  },
});

const getListItemTextProps = (isActive: boolean) => ({
  variant: "body2" as const,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? palette.primary.light : "text.secondary",
});

export function DocsSidebar({
  sections,
  activeItem = "Introduction",
}: DocsSidebarProps) {
  return (
    <Box sx={sidebarContainerStyles}>
      {sections.map((section) => (
        <Box key={section.title} sx={{ mb: 4 }}>
          <Typography variant="overline" sx={sectionTitleStyles}>
            {section.title}
          </Typography>
          <List disablePadding>
            {section.items.map((item) => {
              const isActive = item === activeItem;
              return (
                <ListItem key={item} disablePadding>
                  <ListItemButton sx={getListItemButtonStyles(isActive)}>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={getListItemTextProps(isActive)}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}
