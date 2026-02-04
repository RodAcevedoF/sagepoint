"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Clock, Coffee, Zap, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  optionCard: {
    p: 3,
    borderRadius: 3,
    border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: 2,
    "&:hover": {
      borderColor: palette.primary.light,
      background: alpha(palette.primary.light, 0.05),
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
    flexShrink: 0,
  },
};

// ============================================================================
// Data
// ============================================================================

const scheduleOptions = [
  {
    id: "casual",
    icon: <Coffee size={24} />,
    title: "Casual",
    description: "1-3 hours per week",
    color: "#22c55e",
  },
  {
    id: "regular",
    icon: <Clock size={24} />,
    title: "Regular",
    description: "4-7 hours per week",
    color: "#3b82f6",
  },
  {
    id: "dedicated",
    icon: <Zap size={24} />,
    title: "Dedicated",
    description: "8-14 hours per week",
    color: "#f59e0b",
  },
  {
    id: "intensive",
    icon: <Flame size={24} />,
    title: "Intensive",
    description: "15+ hours per week",
    color: "#ef4444",
  },
];

// ============================================================================
// Component
// ============================================================================

export function ScheduleStep() {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingCard
      icon={<Clock size={32} color={palette.primary.light} />}
      title="Learning commitment"
      subtitle="How much time can you dedicate to learning each week?"
      canProceed={data.weeklyHours.length > 0}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {scheduleOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Box
              onClick={() => updateData("weeklyHours", option.id)}
              sx={{
                ...styles.optionCard,
                ...(data.weeklyHours === option.id && styles.optionCardSelected),
              }}
            >
              <Box
                sx={{
                  ...styles.iconWrapper,
                  background: alpha(option.color, 0.15),
                  color: option.color,
                }}
              >
                {option.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {option.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
    </OnboardingCard>
  );
}
