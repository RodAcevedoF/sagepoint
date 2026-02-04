"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Award, Sprout, Flame, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  optionCard: {
    p: 2.5,
    borderRadius: 3,
    border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: palette.primary.light,
      background: alpha(palette.primary.light, 0.05),
      transform: "translateY(-2px)",
    },
  },
  optionCardSelected: {
    borderColor: palette.primary.main,
    background: alpha(palette.primary.main, 0.1),
    "&:hover": {
      background: alpha(palette.primary.main, 0.15),
    },
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 1.5,
  },
};

// ============================================================================
// Data
// ============================================================================

const experienceLevels = [
  {
    id: "beginner",
    icon: <Sprout size={24} />,
    title: "Beginner",
    description: "Just starting out",
    color: "#4ade80",
  },
  {
    id: "intermediate",
    icon: <Flame size={24} />,
    title: "Intermediate",
    description: "Some experience",
    color: "#f59e0b",
  },
  {
    id: "advanced",
    icon: <Award size={24} />,
    title: "Advanced",
    description: "Solid foundation",
    color: "#3b82f6",
  },
  {
    id: "expert",
    icon: <Rocket size={24} />,
    title: "Expert",
    description: "Deep expertise",
    color: "#a855f7",
  },
];

// ============================================================================
// Component
// ============================================================================

export function ExperienceStep() {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingCard
      icon={<Award size={32} color={palette.primary.light} />}
      title="Your experience level"
      subtitle="This helps us recommend content that matches your current knowledge."
      canProceed={data.experience.length > 0}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        {experienceLevels.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Box
              onClick={() => updateData("experience", level.id)}
              sx={{
                ...styles.optionCard,
                ...(data.experience === level.id && styles.optionCardSelected),
              }}
            >
              <Box
                sx={{
                  ...styles.iconWrapper,
                  background: alpha(level.color, 0.15),
                  color: level.color,
                }}
              >
                {level.icon}
              </Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {level.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {level.description}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </OnboardingCard>
  );
}
