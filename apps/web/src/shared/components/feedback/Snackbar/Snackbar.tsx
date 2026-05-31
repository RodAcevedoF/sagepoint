"use client";

import { Box, IconButton, ButtonBase } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import {
  type SnackbarItem,
  type SnackbarSeverity,
  useSnackbar,
} from "./snackbar-context";
import { useEffect } from "react";

interface SeverityConfig {
  icon: typeof CheckCircle;
  color: string;
}

const severityConfig: Record<SnackbarSeverity, SeverityConfig> = {
  success: { icon: CheckCircle, color: aurora.status.ready },
  error: { icon: XCircle, color: aurora.status.fail },
  warning: { icon: AlertTriangle, color: aurora.status.proc },
  info: { icon: Info, color: aurora.status.concept },
};

const variants = {
  initial: { opacity: 0, x: 100, scale: 0.92 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.92 },
};

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
          gap: "12px",
          padding: "12px 14px",
          minWidth: 320,
          maxWidth: 440,
          borderRadius: aurora.radii.md,
          fontFamily: aurora.font.ui,
          background: `linear-gradient(168deg, color-mix(in oklch, ${aurora.surface2} 92%, transparent), color-mix(in oklch, ${aurora.bg1} 86%, transparent))`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: `1px solid ${auroraTint(config.color, 0.32)}`,
          boxShadow: `0 1px 0 0 oklch(1 0 0 / 0.05) inset, 0 22px 44px -24px ${auroraTint(config.color, 0.45)}`,
          color: aurora.txHi,
        }}
      >
        <Box
          sx={{
            flex: "none",
            width: 38,
            height: 38,
            borderRadius: aurora.radii.md,
            display: "grid",
            placeItems: "center",
            background: auroraTint(config.color, 0.16),
            border: `1px solid ${auroraTint(config.color, 0.3)}`,
            color: config.color,
            boxShadow: `0 0 18px -6px ${auroraTint(config.color, 0.55)}`,
          }}
        >
          <Icon size={18} />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: "13.5px",
            fontWeight: 500,
            lineHeight: 1.45,
            color: aurora.txHi,
          }}
        >
          {item.message}
        </Box>

        {item.action && (
          <ButtonBase
            disableRipple
            onClick={() => {
              item.action?.onClick();
              hideSnackbar(item.id);
            }}
            sx={{
              fontFamily: aurora.font.ui,
              color: config.color,
              fontWeight: 700,
              fontSize: "12.5px",
              padding: "6px 11px",
              borderRadius: aurora.radii.sm,
              border: `1px solid ${auroraTint(config.color, 0.32)}`,
              background: auroraTint(config.color, 0.1),
              transition: "background-color .15s ease, border-color .15s ease",
              "&:hover": {
                background: auroraTint(config.color, 0.18),
                borderColor: auroraTint(config.color, 0.42),
              },
            }}
          >
            {item.action.label}
          </ButtonBase>
        )}

        <IconButton
          size="small"
          onClick={() => hideSnackbar(item.id)}
          sx={{
            width: 28,
            height: 28,
            color: aurora.txMid,
            borderRadius: aurora.radii.sm,
            "&:hover": {
              color: aurora.txHi,
              background: auroraTint(aurora.line2, 0.4),
            },
          }}
        >
          <X size={15} />
        </IconButton>
      </Box>
    </motion.div>
  );
}

export function Snackbar() {
  const { snackbars } = useSnackbar();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 80, sm: 24 },
        right: { xs: 12, sm: 24 },
        left: { xs: 12, sm: "auto" },
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
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
