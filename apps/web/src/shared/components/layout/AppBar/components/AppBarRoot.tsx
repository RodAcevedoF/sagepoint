"use client";

import { type ReactNode, type CSSProperties } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import { motion, LayoutGroup, type Variants } from "framer-motion";
import { aurora } from "@/shared/theme";
import { AppBarProvider } from "../AppBarContext";
import { useHoverReveal } from "../useHoverReveal";

export interface AppBarProps {
  children: ReactNode;
  /** Show on hover at bottom of screen on desktop (default: true) */
  revealOnHover?: boolean;
  /** Always visible on desktop (disables hover reveal). Mobile is always visible regardless. */
  alwaysVisible?: boolean;
  /** Default active item id */
  defaultActive?: string | null;
}

const containerVariants: Variants = {
  hidden: { x: "-50%", y: 40, opacity: 0, scale: 0.92, pointerEvents: "none" },
  visible: {
    x: "-50%",
    y: 0,
    opacity: 1,
    scale: 1,
    pointerEvents: "auto",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.8,
    },
  },
};

const triggerSx: SxProps<Theme> = {
  display: { xs: "none", sm: "block" },
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: 100,
  zIndex: 1299,
};

const barWrapperSx: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  gap: { xs: "2px", sm: "4px" },
  padding: { xs: "6px", sm: "9px" },
  borderRadius: 999,
  background: `linear-gradient(168deg, color-mix(in oklch, ${aurora.surface2} 92%, transparent), color-mix(in oklch, ${aurora.bg1} 86%, transparent))`,
  border: `1px solid ${aurora.line2}`,
  boxShadow: `0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 24px 50px -28px oklch(0.04 0.05 264 / 0.95)`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const navStyle = (isMobile: boolean): CSSProperties => ({
  position: "fixed",
  bottom: isMobile ? "max(10px, env(safe-area-inset-bottom))" : 24,
  left: "50%",
  zIndex: 1300,
  maxWidth: isMobile ? "calc(100vw - 12px)" : undefined,
  willChange: "transform, opacity",
});

export function AppBarRoot({
  children,
  revealOnHover = true,
  alwaysVisible = false,
  defaultActive,
}: AppBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isRevealed, triggerProps, barProps } = useHoverReveal({
    disabled: alwaysVisible || isMobile,
    hideDelay: 500,
  });

  const shouldShow = isMobile || alwaysVisible || isRevealed;

  return (
    <AppBarProvider defaultActive={defaultActive}>
      <LayoutGroup id="navbar-items">
        {revealOnHover && !alwaysVisible && !isMobile && (
          <Box {...triggerProps} sx={triggerSx} />
        )}

        <motion.nav
          variants={containerVariants}
          initial={isMobile ? "visible" : "hidden"}
          animate={shouldShow ? "visible" : "hidden"}
          {...(isMobile ? {} : barProps)}
          style={navStyle(isMobile)}
        >
          <Box sx={barWrapperSx}>{children}</Box>
        </motion.nav>
      </LayoutGroup>
    </AppBarProvider>
  );
}
