"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Chip,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  alpha,
  type SxProps,
  type Theme,
} from "@mui/material";
import { palette } from "@/shared/theme";

export interface DocsSidebarItem {
  id: string;
  label: string;
}

interface DocsSidebarProps {
  items: DocsSidebarItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

// ── Desktop sticky sidebar ─────────────────────────────────────────────────

const styles = {
  root: {
    position: "sticky",
    top: 100,
    alignSelf: "flex-start",
    width: { md: 220 },
    flexShrink: 0,
    pr: 3,
    display: { xs: "none", md: "block" },
  } satisfies SxProps<Theme>,
  heading: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: 1.5,
    color: alpha("#f5f5f5", 0.35),
    mb: 1,
    px: 1.5,
  } satisfies SxProps<Theme>,
  listItem: {
    borderRadius: 1.5,
    py: 0.6,
    px: 1.5,
    mb: 0.25,
    color: alpha("#f5f5f5", 0.5),
    transition: "all 0.15s ease",
    "&:hover": {
      color: "#f5f5f5",
      bgcolor: alpha(palette.primary.light, 0.05),
    },
  } satisfies SxProps<Theme>,
  activeListItem: {
    color: palette.primary.light,
    bgcolor: alpha(palette.primary.light, 0.08),
    "&:hover": {
      color: palette.primary.light,
      bgcolor: alpha(palette.primary.light, 0.1),
    },
  } satisfies SxProps<Theme>,
  itemText: {
    "& .MuiListItemText-primary": {
      fontSize: "0.835rem",
      fontWeight: 500,
    },
  } satisfies SxProps<Theme>,
};

export const DocsSidebar = ({
  items,
  activeId,
  onNavigate,
}: DocsSidebarProps) => {
  return (
    <Box sx={styles.root}>
      <Typography variant="overline" sx={styles.heading}>
        ON THIS PAGE
      </Typography>
      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.id}
            id={`sidebar-item-${item.id}`}
            sx={{
              ...styles.listItem,
              ...(activeId === item.id ? styles.activeListItem : {}),
            }}
            onClick={() => onNavigate(item.id)}
          >
            <ListItemText primary={item.label} sx={styles.itemText} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

// ── Mobile sticky pill strip ───────────────────────────────────────────────

const mobileNavStyles = {
  strip: {
    display: { xs: "flex", md: "none" },
    position: "sticky",
    top: 56,
    zIndex: 10,
    bgcolor: "background.default",
    borderBottom: `1px solid ${alpha("#fff", 0.07)}`,
    gap: 1,
    px: 2,
    pt: 2,
    pb: 1,
    mx: -2,
    overflowX: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" },
  } satisfies SxProps<Theme>,
  chip: {
    flexShrink: 0,
    fontSize: "0.75rem",
    fontWeight: 400,
    color: alpha("#f5f5f5", 0.5),
    bgcolor: "transparent",
    border: `1px solid ${alpha("#fff", 0.08)}`,
    transition: "all 0.15s ease",
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.08),
      color: "#f5f5f5",
    },
  } satisfies SxProps<Theme>,
  chipActive: {
    fontWeight: 600,
    color: palette.primary.light,
    bgcolor: alpha(palette.primary.light, 0.12),
    border: `1px solid ${alpha(palette.primary.light, 0.3)}`,
    "&:hover": {
      bgcolor: alpha(palette.primary.light, 0.1),
      color: palette.primary.light,
    },
  } satisfies SxProps<Theme>,
};

export const DocsMobileNav = ({
  items,
  activeId,
  onNavigate,
}: DocsSidebarProps) => {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const activeEl = document.getElementById(`mobile-nav-${activeId}`);
    if (!strip || !activeEl) return;
    const target =
      activeEl.offsetLeft - (strip.clientWidth - activeEl.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeId]);

  return (
    <Box ref={stripRef} sx={mobileNavStyles.strip}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <Chip
            key={item.id}
            id={`mobile-nav-${item.id}`}
            label={item.label}
            size="small"
            onClick={() => onNavigate(item.id)}
            sx={{
              ...mobileNavStyles.chip,
              ...(isActive ? mobileNavStyles.chipActive : {}),
            }}
          />
        );
      })}
    </Box>
  );
};
