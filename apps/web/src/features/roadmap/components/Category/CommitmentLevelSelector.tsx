"use client";

import { Box, Typography, alpha, useTheme, type Theme } from "@mui/material";
import { Coffee, Clock, Zap, Flame } from "lucide-react";
import { motion } from "framer-motion";

export const COMMITMENT_LEVELS = [
  {
    id: "casual" as const,
    icon: Coffee,
    title: "Casual",
    description: "1-3 hrs/week",
    color: "#22c55e",
    hours: 2,
  },
  {
    id: "regular" as const,
    icon: Clock,
    title: "Regular",
    description: "4-7 hrs/week",
    color: "#3b82f6",
    hours: 5,
  },
  {
    id: "dedicated" as const,
    icon: Zap,
    title: "Dedicated",
    description: "8-14 hrs/week",
    color: "#f59e0b",
    hours: 11,
  },
  {
    id: "intensive" as const,
    icon: Flame,
    title: "Intensive",
    description: "15+ hrs/week",
    color: "#ef4444",
    hours: 15,
  },
] as const;

export type CommitmentLevel = (typeof COMMITMENT_LEVELS)[number]["id"];

const makeStyles = (theme: Theme) => ({
  label: {
    color: theme.palette.text.secondary,
    mb: 1.5,
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1.5,
    mb: 3,
  },
  iconBox: (color: string) => ({
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 0.5,
    background: alpha(color, 0.15),
    color,
  }),
  card: (color: string, isSelected: boolean, theme: Theme) => ({
    p: 1.5,
    borderRadius: 3,
    border: `1px solid ${alpha(
      isSelected ? color : theme.palette.primary.light,
      isSelected ? 0.6 : 0.15,
    )}`,
    background: isSelected ? alpha(color, 0.1) : "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    "&:hover": {
      borderColor: color,
      background: alpha(color, 0.05),
      transform: "translateY(-2px)",
    },
  }),
});

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
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <>
      <Typography variant="body2" sx={styles.label}>
        Weekly commitment (optional)
      </Typography>
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
                sx={styles.card(level.color, isSelected, theme)}
              >
                <Box sx={styles.iconBox(level.color)}>
                  <Icon size={20} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: "block" }}
                >
                  {level.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.6rem" }}
                >
                  {level.description}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </>
  );
}
