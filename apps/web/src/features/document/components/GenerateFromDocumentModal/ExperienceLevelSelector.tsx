"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";
import { Sprout, Flame, Award, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const EXPERIENCE_LEVELS = [
  {
    id: "beginner" as const,
    icon: Sprout,
    title: "Beginner",
    color: "#4ade80",
  },
  {
    id: "intermediate" as const,
    icon: Flame,
    title: "Intermediate",
    color: "#f59e0b",
  },
  { id: "advanced" as const, icon: Award, title: "Advanced", color: "#3b82f6" },
  { id: "expert" as const, icon: Rocket, title: "Expert", color: "#a855f7" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["id"];

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

  return (
    <>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 1.5, fontWeight: 500 }}
      >
        Your experience level (optional)
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1.5,
          mb: 2,
          pointerEvents: disabled ? "none" : "auto",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {EXPERIENCE_LEVELS.map((level, index) => {
          const Icon = level.icon;
          const isSelected = value === level.id;
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.04 }}
            >
              <Box
                onClick={() => onChange(isSelected ? undefined : level.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  border: `1px solid ${alpha(
                    isSelected ? level.color : theme.palette.primary.light,
                    isSelected ? 0.6 : 0.15,
                  )}`,
                  background: isSelected
                    ? alpha(level.color, 0.1)
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  "&:hover": {
                    borderColor: level.color,
                    background: alpha(level.color, 0.05),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 0.5,
                    background: alpha(level.color, 0.15),
                    color: level.color,
                  }}
                >
                  <Icon size={18} />
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
