"use client";

import { Box, IconButton, Typography, alpha, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { palette } from "@/common/theme";
import { type SnackbarItem, type SnackbarSeverity, useSnackbar } from "./snackbar-context";
import { useEffect } from "react";

// ============================================================================
// Config
// ============================================================================

const severityConfig: Record<
  SnackbarSeverity,
  { icon: typeof CheckCircle; color: string; bg: string }
> = {
  success: {
    icon: CheckCircle,
    color: palette.success.light,
    bg: palette.success.main,
  },
  error: {
    icon: XCircle,
    color: palette.error.light,
    bg: palette.error.main,
  },
  warning: {
    icon: AlertTriangle,
    color: palette.warning.light,
    bg: palette.warning.main,
  },
  info: {
    icon: Info,
    color: palette.primary.light,
    bg: palette.primary.main,
  },
};

// ============================================================================
// Animation Variants
// ============================================================================

const variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.9 },
};

// ============================================================================
// Snackbar Item
// ============================================================================

function SnackbarItemComponent({ item }: { item: SnackbarItem }) {
  const { hideSnackbar } = useSnackbar();
  const config = severityConfig[item.severity];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => hideSnackbar(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, hideSnackbar]);

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1.5,
          px: 2,
          minWidth: 320,
          maxWidth: 420,
          borderRadius: 3,
          bgcolor: alpha(palette.background.paper, 0.85),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(config.color, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(config.bg, 0.25)}, 0 0 0 1px ${alpha(config.color, 0.1)} inset`,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(config.bg, 0.15),
            color: config.color,
            flexShrink: 0,
          }}
        >
          <Icon size={20} />
        </Box>

        {/* Message */}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: "text.primary",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {item.message}
        </Typography>

        {/* Action Button */}
        {item.action && (
          <Button
            size="small"
            onClick={() => {
              item.action?.onClick();
              hideSnackbar(item.id);
            }}
            sx={{
              color: config.color,
              fontWeight: 600,
              fontSize: "0.75rem",
              minWidth: "auto",
              px: 1.5,
              "&:hover": {
                bgcolor: alpha(config.color, 0.1),
              },
            }}
          >
            {item.action.label}
          </Button>
        )}

        {/* Close Button */}
        <IconButton
          size="small"
          onClick={() => hideSnackbar(item.id)}
          sx={{
            color: "text.secondary",
            p: 0.5,
            "&:hover": {
              color: "text.primary",
              bgcolor: alpha(palette.text.primary, 0.1),
            },
          }}
        >
          <X size={16} />
        </IconButton>
      </Box>
    </motion.div>
  );
}

// ============================================================================
// Snackbar Container
// ============================================================================

export function Snackbar() {
  const { snackbars } = useSnackbar();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <AnimatePresence mode="popLayout">
        {snackbars.map((item) => (
          <SnackbarItemComponent key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </Box>
  );
}
