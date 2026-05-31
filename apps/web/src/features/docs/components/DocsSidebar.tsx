"use client";

import { useEffect, useRef } from "react";
import {
  Box,
  Chip,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  type SxProps,
  type Theme,
} from "@mui/material";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

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
    fontFamily: auroraPalette.font.mono,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: auroraPalette.txLow,
    mb: 1.25,
    px: 1.5,
    display: "block",
  } satisfies SxProps<Theme>,
  listItem: {
    borderRadius: auroraPalette.radii.sm,
    py: 0.6,
    px: 1.5,
    mb: 0.25,
    color: auroraPalette.txMid,
    transition: "all 0.15s ease",
    "&:hover": {
      color: auroraPalette.txHi,
      bgcolor: auroraTint(auroraPalette.teal, 0.06),
    },
  } satisfies SxProps<Theme>,
  activeListItem: {
    color: auroraPalette.teal,
    bgcolor: auroraTint(auroraPalette.teal, 0.12),
    "&:hover": {
      color: auroraPalette.teal,
      bgcolor: auroraTint(auroraPalette.teal, 0.16),
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
      <Typography component="span" sx={styles.heading}>
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
    bgcolor: auroraPalette.bg0,
    borderBottom: `1px solid ${auroraPalette.line}`,
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
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: auroraPalette.txMid,
    bgcolor: auroraPalette.surface2,
    border: `1px solid ${auroraPalette.line}`,
    borderRadius: auroraPalette.radii.pill,
    transition: "all 0.15s ease",
    "&:hover": {
      bgcolor: auroraTint(auroraPalette.teal, 0.08),
      color: auroraPalette.txHi,
      borderColor: auroraTint(auroraPalette.teal, 0.25),
    },
  } satisfies SxProps<Theme>,
  chipActive: {
    color: auroraPalette.teal,
    bgcolor: auroraTint(auroraPalette.teal, 0.15),
    border: `1px solid ${auroraTint(auroraPalette.teal, 0.4)}`,
    "&:hover": {
      bgcolor: auroraTint(auroraPalette.teal, 0.22),
      color: auroraPalette.teal,
      borderColor: auroraTint(auroraPalette.teal, 0.5),
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
