"use client";

import { type ComponentType, type CSSProperties } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
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

const HORIZONTAL_PAD = 10;
const COLLAPSED_PAD = 11;
const VERTICAL_PAD = 7;

const makeStyles = (
  isActive: boolean,
  showLabel: boolean,
  disabled: boolean,
  accentColor: string,
): AppBarItemStyles => ({
  button: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: showLabel ? 6 : 0,
    padding: `${VERTICAL_PAD}px ${showLabel ? HORIZONTAL_PAD : COLLAPSED_PAD}px`,
    borderRadius: 999,
    border: "none",
    background: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    outline: "none",
    color: isActive ? accentColor : aurora.txMid,
    fontFamily: aurora.font.ui,
    fontWeight: 600,
    fontSize: "12px",
    letterSpacing: "-0.005em",
    whiteSpace: "nowrap",
    WebkitTapHighlightColor: "transparent",
    transition: "color .25s, padding .35s ease, gap .35s ease",
  },
  activeBg: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
    background: auroraTint(accentColor, 0.16),
    boxShadow: `0 0 0 1px ${auroraTint(accentColor, 0.3)} inset, 0 0 22px -6px ${auroraTint(accentColor, 0.7)}`,
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
    filter: "blur(14px)",
    opacity: 0.5,
    pointerEvents: "none",
    zIndex: -1,
  },
  iconContainer: {
    display: "grid",
    placeItems: "center",
    color: isActive ? accentColor : aurora.txLow,
    transition: "color .25s",
  },
  label: {
    display: "inline-block",
    maxWidth: showLabel ? 92 : 0,
    opacity: showLabel ? 1 : 0,
    overflow: "hidden",
    transition: "max-width .3s ease, opacity .22s",
  },
  dot: {
    position: "absolute",
    left: "50%",
    bottom: 2,
    transform: "translateX(-50%)",
    height: 2.5,
    width: isActive ? 16 : 0,
    borderRadius: 999,
    background: accentColor,
    boxShadow: `0 0 8px -1px ${accentColor}`,
    transition: "width .3s ease",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: aurora.status.fail,
    boxShadow: `0 0 0 2px ${aurora.bg1}`,
  },
});

const itemVariants: Variants = {
  idle: { scale: 1 },
  tap: { scale: 0.94 },
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
  const isActive = activeItem === id;
  // Compact behavior: only the active item shows its label on the mobile bar.
  const showLabel = isActive;

  const accentColor = resolveAccent(tone, accent);
  const styles = makeStyles(isActive, showLabel, disabled, accentColor);

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
      whileTap={disabled ? undefined : "tap"}
      onClick={handleClick}
      disabled={disabled}
      style={styles.button}
      aria-label={label}
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
        <Icon size={18} strokeWidth={isActive ? 2.1 : 1.75} />
        {badge && <Box sx={styles.badge} />}
      </Box>

      <Box component="span" sx={styles.label}>
        {label}
      </Box>

      <Box sx={styles.dot} />
    </motion.button>
  );
}
