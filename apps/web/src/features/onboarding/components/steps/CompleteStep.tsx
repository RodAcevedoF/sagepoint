"use client";

import { useState } from "react";
import { Box, Typography, Stack, alpha, CircularProgress } from "@mui/material";
import { CheckCircle2, Target, Layers, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { Card } from "@/common/components/Card";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { useSubmitOnboardingCommand } from "@/application/onboarding/commands/submit-onboarding.command";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  summaryCard: (accentColor: string) => ({
    p: 2,
    borderRadius: 2,
    background: alpha(accentColor, 0.07),
    border: `1px solid ${alpha(accentColor, 0.2)}`,
    display: "flex",
    alignItems: "center",
    gap: 2,
    transition: "background 0.2s",
    "&:hover": {
      background: alpha(accentColor, 0.13),
    },
  }),
  iconBox: (accentColor: string) => ({
    width: 36,
    height: 36,
    background: alpha(accentColor, 0.15),
    border: `1px solid ${alpha(accentColor, 0.3)}`,
  }),
  label: {
    color: palette.text.secondary,
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
    color: palette.text.primary,
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    pt: 2,
  },
  error: {
    mt: 1,
  },
};

// ============================================================================
// Helpers
// ============================================================================

const experienceLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const scheduleLabels: Record<string, string> = {
  casual: "1-3 hours/week",
  regular: "4-7 hours/week",
  dedicated: "8-14 hours/week",
  intensive: "15+ hours/week",
};

// ============================================================================
// Component
// ============================================================================

export function CompleteStep() {
  const { data } = useOnboarding();
  const { execute: submitOnboarding, isLoading } = useSubmitOnboardingCommand();
  const [error, setError] = useState("");

  const summaryItems = [
    {
      icon: <Target size={18} />,
      label: "Goal",
      value: data.goal,
      color: palette.warning.light,
    },
    {
      icon: <Award size={18} />,
      label: "Experience",
      value: experienceLabels[data.experience] || data.experience,
      color: palette.experience.expert,
    },
    {
      icon: <Layers size={18} />,
      label: "Interests",
      value: `${data.interests.length} topic${data.interests.length !== 1 ? "s" : ""} selected`,
      color: palette.info.light,
    },
    {
      icon: <Clock size={18} />,
      label: "Commitment",
      value: scheduleLabels[data.weeklyHours] || data.weeklyHours,
      color: palette.success.light,
    },
  ];

  const handleComplete = async () => {
    setError("");
    try {
      await submitOnboarding(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <OnboardingCard
      icon={<CheckCircle2 size={32} color={palette.success.light} />}
      title="You're all set!"
      subtitle="Here's a summary of your preferences. Ready to start your journey?"
      nextLabel={isLoading ? "Setting up..." : "Start Learning"}
      onNext={handleComplete}
      canProceed={!isLoading}
      showSkip={false}
    >
      <Stack spacing={1.5}>
        {summaryItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Box sx={styles.summaryCard(item.color)}>
              <Card.IconBox sx={styles.iconBox(item.color)}>
                <Box sx={{ color: item.color, display: "flex" }}>
                  {item.icon}
                </Box>
              </Card.IconBox>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={styles.label}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={styles.value}>
                  {item.value || "Not specified"}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}

        {isLoading && (
          <Box sx={styles.loader}>
            <CircularProgress size={24} sx={{ color: palette.primary.light }} />
          </Box>
        )}

        {error && (
          <Typography color="error" variant="caption" sx={styles.error}>
            {error}
          </Typography>
        )}
      </Stack>
    </OnboardingCard>
  );
}
