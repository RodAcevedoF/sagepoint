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
  summaryCard: {
    p: 2,
    borderRadius: 2,
    background: alpha(palette.primary.light, 0.05),
    border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    display: "flex",
    alignItems: "center",
    gap: 2,
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
    { icon: <Target size={18} />, label: "Goal", value: data.goal },
    {
      icon: <Award size={18} />,
      label: "Experience",
      value: experienceLabels[data.experience] || data.experience,
    },
    {
      icon: <Layers size={18} />,
      label: "Interests",
      value: `${data.interests.length} topic${data.interests.length !== 1 ? "s" : ""} selected`,
    },
    {
      icon: <Clock size={18} />,
      label: "Commitment",
      value: scheduleLabels[data.weeklyHours] || data.weeklyHours,
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
      icon={<CheckCircle2 size={32} color={palette.primary.light} />}
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
            <Box sx={styles.summaryCard}>
              <Card.IconBox sx={{ width: 36, height: 36 }}>
                {item.icon}
              </Card.IconBox>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.value || "Not specified"}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Stack>
    </OnboardingCard>
  );
}
