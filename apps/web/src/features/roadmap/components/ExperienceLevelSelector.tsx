"use client";

import { Box, Typography, alpha, useTheme, type Theme } from "@mui/material";
import { Sprout, Flame, Award, Rocket } from "lucide-react";
import { motion } from "framer-motion";

// ============================================================================
// Data
// ============================================================================

const EXPERIENCE_LEVELS = [
  { id: "beginner" as const, icon: Sprout, title: "Beginner" },
  { id: "intermediate" as const, icon: Flame, title: "Intermediate" },
  { id: "advanced" as const, icon: Award, title: "Advanced" },
  { id: "expert" as const, icon: Rocket, title: "Expert" },
];

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["id"];

// ============================================================================
// Styles
// ============================================================================

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

// ============================================================================
// Component
// ============================================================================

interface ExperienceLevelSelectorProps {
  value?: ExperienceLevel;
  onChange: (level: ExperienceLevel | undefined) => void;
  disabled?: boolean;
}

export function ExperienceLevelSelector({
  value,
  onChange,
  disabled,
}: ExperienceLevelSelectorProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <>
      <Typography variant="body2" sx={styles.label}>
        Your experience level (optional)
      </Typography>
      <Box
        sx={{
          ...styles.grid,
          pointerEvents: disabled ? "none" : "auto",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {EXPERIENCE_LEVELS.map((level, index) => {
          const Icon = level.icon;
          const isSelected = value === level.id;
          const color = theme.palette.experience[level.id];
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Box
                onClick={() => onChange(isSelected ? undefined : level.id)}
                sx={styles.card(color, isSelected, theme)}
              >
                <Box sx={styles.iconBox(color)}>
                  <Icon size={20} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, display: "block" }}
                >
                  {level.title}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </>
  );
}

/** Check if a string is a valid experience level */
export function isExperienceLevel(value?: string): value is ExperienceLevel {
  return EXPERIENCE_LEVELS.some((l) => l.id === value);
}
