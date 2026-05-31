"use client";

import { type ReactNode, type CSSProperties } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type Variants,
} from "framer-motion";
import { aurora } from "@/shared/theme";
import { AppBarProvider } from "../AppBarContext";
import { useHoverReveal } from "../useHoverReveal";
import { useScrollReveal } from "../useScrollReveal";

export interface AppBarProps {
  children: ReactNode;
  /** Show on hover at bottom of screen (default: true) */
  revealOnHover?: boolean;
  /** Always visible (disables hover reveal) */
  alwaysVisible?: boolean;
  /** Default active item id */
  defaultActive?: string | null;
}

const containerVariants: Variants = {
  hidden: {
    x: "-50%",
    y: 40,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    x: "-50%",
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.02,
    },
  },
  exit: {
    x: "-50%",
    y: 40,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
};

interface AppBarRootStyles {
  trigger: SxProps<Theme>;
  barWrapper: SxProps<Theme>;
  nav: CSSProperties;
}

const makeStyles = (
  isMobile: boolean,
  shouldShow: boolean,
): AppBarRootStyles => ({
  trigger: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1299,
    pointerEvents: shouldShow ? "none" : "auto",
  },
  barWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    gap: "4px",
    padding: "9px",
    borderRadius: 999,
    background: `linear-gradient(168deg, color-mix(in oklch, ${aurora.surface2} 92%, transparent), color-mix(in oklch, ${aurora.bg1} 86%, transparent))`,
    border: `1px solid ${aurora.line2}`,
    boxShadow: `0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 24px 50px -28px oklch(0.04 0.05 264 / 0.95)`,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  },
  nav: {
    position: "fixed",
    bottom: isMobile ? 16 : 24,
    left: "50%",
    zIndex: 1300,
    maxWidth: isMobile ? "calc(100vw - 16px)" : undefined,
  },
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
  const isScrollVisible = useScrollReveal({
    disabled: !isMobile || alwaysVisible,
  });

  const shouldShow = alwaysVisible || (isMobile ? isScrollVisible : isRevealed);
  const styles = makeStyles(isMobile, shouldShow);

  return (
    <AppBarProvider defaultActive={defaultActive}>
      <LayoutGroup id="navbar-items">
        {revealOnHover && !alwaysVisible && !isMobile && (
          <Box {...triggerProps} sx={styles.trigger} />
        )}

        <AnimatePresence>
          {shouldShow && (
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              {...barProps}
              style={styles.nav}
            >
              <Box sx={styles.barWrapper}>{children}</Box>
            </motion.nav>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </AppBarProvider>
  );
}
