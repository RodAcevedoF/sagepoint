"use client";

import { type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { LayoutGroup } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { AppBarProvider } from "../AppBarContext";

export interface AppBarProps {
  children: ReactNode;
  /** Default active item id (usually derived from the current route) */
  defaultActive?: string | null;
}

const navSx: SxProps<Theme> = {
  display: { xs: "block", md: "none" },
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1300,
  background: `linear-gradient(0deg, ${auroraTint(aurora.surface2, 0.72)}, ${auroraTint(aurora.bg1, 0.5)})`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderTop: `1px solid oklch(1 0 0 / 0.035)`,
  paddingBottom: "env(safe-area-inset-bottom)",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    top: "-1px",
    height: "1px",
    background: `linear-gradient(90deg, transparent, ${auroraTint(aurora.teal, 0.5)} 30%, ${auroraTint(aurora.status.concept, 0.45)} 70%, transparent)`,
    pointerEvents: "none",
  },
};

const barSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  width: "100%",
  padding: "6px 6px",
  minHeight: 46,
};

export function AppBarRoot({ children, defaultActive }: AppBarProps) {
  return (
    <AppBarProvider defaultActive={defaultActive}>
      <LayoutGroup id="navbar-items">
        <Box component="nav" sx={navSx}>
          <Box sx={barSx}>{children}</Box>
        </Box>
      </LayoutGroup>
    </AppBarProvider>
  );
}
