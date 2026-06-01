"use client";

import { Box, Typography } from "@mui/material";
import { Coffee, Clock, Zap, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";

export const COMMITMENT_LEVELS = [
  {
    id: "casual" as const,
    icon: Coffee,
    title: "Casual",
    description: "1-3 hrs/week",
    color: aurora.status.ready,
    hours: 2,
  },
  {
    id: "regular" as const,
    icon: Clock,
    title: "Regular",
    description: "4-7 hrs/week",
    color: aurora.status.concept,
    hours: 5,
  },
  {
    id: "dedicated" as const,
    icon: Zap,
    title: "Dedicated",
    description: "8-14 hrs/week",
    color: aurora.status.proc,
    hours: 11,
  },
  {
    id: "intensive" as const,
    icon: Flame,
    title: "Intensive",
    description: "15+ hrs/week",
    color: aurora.status.fail,
    hours: 15,
  },
] as const;

export type CommitmentLevel = (typeof COMMITMENT_LEVELS)[number]["id"];

const styles = {
  label: {
    color: aurora.txMid,
    fontFamily: aurora.font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    mb: 1.25,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1.25,
  },
  iconBox: (color: string) => ({
    width: 40,
    height: 40,
    borderRadius: aurora.radii.md,
    display: "grid",
    placeItems: "center",
    mx: "auto",
    mb: 0.75,
    background: `color-mix(in oklch, ${color} 16%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(color, 0.28)}`,
    color,
    boxShadow: `0 0 18px -6px ${auroraTint(color, 0.55)}`,
  }),
  card: (color: string, isSelected: boolean) => ({
    p: 1.25,
    borderRadius: aurora.radii.md,
    border: `1px solid ${isSelected ? auroraTint(color, 0.45) : aurora.line}`,
    background: isSelected
      ? `color-mix(in oklch, ${color} 10%, ${aurora.surface})`
      : aurora.surface,
    cursor: "pointer",
    transition: "transform .2s, border-color .2s, background .2s",
    textAlign: "center",
    "&:hover": {
      borderColor: auroraTint(color, 0.5),
      background: `color-mix(in oklch, ${color} 6%, ${aurora.surface})`,
      transform: "translateY(-2px)",
    },
  }),
  title: {
    fontFamily: aurora.font.ui,
    fontWeight: 600,
    color: aurora.txHi,
    display: "block",
    fontSize: "0.75rem",
  },
  desc: {
    color: aurora.txLow,
    fontSize: "0.62rem",
    fontFamily: aurora.font.ui,
  },
};

interface CommitmentLevelSelectorProps {
  value?: CommitmentLevel;
  onChange: (level: CommitmentLevel | undefined) => void;
  disabled?: boolean;
}

export function CommitmentLevelSelector({
  value,
  onChange,
  disabled,
}: CommitmentLevelSelectorProps) {
  return (
    <Box>
      <Typography sx={styles.label}>Weekly commitment (optional)</Typography>
      <Box
        sx={{
          ...styles.grid,
          pointerEvents: disabled ? "none" : "auto",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {COMMITMENT_LEVELS.map((level, index) => {
          const Icon = level.icon;
          const isSelected = value === level.id;
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Box
                onClick={() => onChange(isSelected ? undefined : level.id)}
                sx={styles.card(level.color, isSelected)}
              >
                <Box sx={styles.iconBox(level.color)}>
                  <Icon size={20} />
                </Box>
                <Typography variant="caption" sx={styles.title}>
                  {level.title}
                </Typography>
                <Typography variant="caption" sx={styles.desc}>
                  {level.description}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
