"use client";

import { type ComponentType, type CSSProperties } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";
import { motion, type Variants } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";
import { useAppBar } from "../AppBarContext";

export interface AppBarItemProps {
  id: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number | boolean;
  disabled?: boolean;
  /** Aurora tone token; defaults to teal */
  tone?: AuroraTone;
  /** Explicit accent color; wins over `tone` */
  accent?: string;
}

interface AppBarItemStyles {
  button: CSSProperties;
  activeBg: SxProps<Theme>;
  activeGlow: SxProps<Theme>;
  iconContainer: SxProps<Theme>;
  label: SxProps<Theme>;
  dot: SxProps<Theme>;
  badge: SxProps<Theme>;
}

const makeStyles = (
  isMobile: boolean,
  isActive: boolean,
  showLabel: boolean,
  disabled: boolean,
  accentColor: string,
): AppBarItemStyles => {
  const horizontalPad = isMobile ? 11 : 20;
  const collapsedPad = isMobile ? 8 : 15;
  const verticalPad = isMobile ? 7 : 12;
  return {
    button: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: showLabel ? (isMobile ? 7 : 10) : 0,
      padding: `${verticalPad}px ${showLabel ? horizontalPad : collapsedPad}px`,
      borderRadius: 999,
      border: "none",
      background: "transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.35 : 1,
      outline: "none",
      color: isActive ? accentColor : aurora.txMid,
      fontFamily: aurora.font.ui,
      fontWeight: 600,
      fontSize: isMobile ? "12px" : "14.5px",
      letterSpacing: isMobile ? "-0.005em" : undefined,
      whiteSpace: "nowrap",
      WebkitTapHighlightColor: "transparent",
      transition: "color .25s, padding .35s ease, gap .35s ease",
    },
    activeBg: {
      position: "absolute",
      inset: 0,
      borderRadius: 999,
      background: auroraTint(accentColor, 0.16),
      boxShadow: `0 0 0 1px ${auroraTint(accentColor, 0.3)} inset, 0 0 28px -6px ${auroraTint(accentColor, 0.7)}`,
      zIndex: -1,
    },
    activeGlow: {
      position: "absolute",
      top: "-60%",
      bottom: "-60%",
      left: 0,
      right: 0,
      borderRadius: 999,
      background: `radial-gradient(closest-side, ${auroraTint(accentColor, 0.4)}, transparent 75%)`,
      filter: "blur(16px)",
      opacity: 0.55,
      pointerEvents: "none",
      zIndex: -1,
    },
    iconContainer: {
      display: "grid",
      placeItems: "center",
      color: isActive ? accentColor : aurora.txLow,
      transform: isActive ? "translateY(-0.5px)" : "none",
      transition: "color .25s, transform .25s",
    },
    label: {
      display: "inline-block",
      maxWidth: showLabel ? 240 : 0,
      opacity: showLabel ? 1 : 0,
      overflow: "hidden",
      transition: "max-width .35s ease, opacity .25s",
    },
    dot: {
      position: "absolute",
      left: "50%",
      bottom: isMobile ? 2 : 4,
      transform: "translateX(-50%)",
      height: isMobile ? 2.5 : 3,
      width: isActive ? (isMobile ? 18 : 22) : 0,
      borderRadius: 999,
      background: accentColor,
      boxShadow: `0 0 8px -1px ${accentColor}`,
      transition: "width .3s ease",
    },
    badge: {
      position: "absolute",
      top: 7,
      right: 7,
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: aurora.status.fail,
      boxShadow: `0 0 0 2px ${aurora.bg1}`,
    },
  };
};

const itemVariants: Variants = {
  idle: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -1,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  tap: { scale: 0.97 },
  active: { scale: 1, y: 0 },
};

export function AppBarItem({
  id,
  icon: Icon,
  label,
  href,
  onClick,
  badge,
  disabled = false,
  tone,
  accent,
}: AppBarItemProps) {
  const { activeItem, setActiveItem } = useAppBar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isActive = activeItem === id;
  // Compact behavior: on mobile, only the active item shows its label.
  const showLabel = isActive || !isMobile;

  const accentColor = resolveAccent(tone, accent);
  const styles = makeStyles(
    isMobile,
    isActive,
    showLabel,
    disabled,
    accentColor,
  );

  const handleClick = () => {
    if (disabled) return;
    setActiveItem(id);
    onClick?.();
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <motion.button
      variants={itemVariants}
      initial="idle"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      animate={isActive ? "active" : "idle"}
      onClick={handleClick}
      disabled={disabled}
      style={styles.button}
    >
      {isActive && (
        <>
          <Box
            component={motion.div}
            layoutId="navbar-active-glow"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            sx={styles.activeGlow}
          />
          <Box
            component={motion.div}
            layoutId="navbar-active-bg"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 40,
              mass: 0.6,
            }}
            sx={styles.activeBg}
          />
        </>
      )}

      <Box sx={styles.iconContainer}>
        <Icon size={isMobile ? 17 : 20} strokeWidth={isActive ? 2.2 : 1.8} />
        {badge && <Box sx={styles.badge} />}
      </Box>

      <Box component="span" sx={styles.label}>
        {label}
      </Box>

      <Box sx={styles.dot} />
    </motion.button>
  );
}
