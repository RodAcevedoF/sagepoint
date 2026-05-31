"use client";

import { useState } from "react";
import { Box, Stack, CircularProgress } from "@mui/material";
import { CheckCircle2, Target, Layers, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";
import { useSubmitOnboardingCommand } from "@/application/onboarding/commands/submit-onboarding.command";

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

export function CompleteStep() {
  const { data } = useOnboarding();
  const { execute: submitOnboarding, isLoading } = useSubmitOnboardingCommand();
  const [error, setError] = useState("");

  const summaryItems: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: AuroraTone;
  }> = [
    {
      icon: <Target size={18} />,
      label: "Goal",
      value: data.goal,
      tone: "concept",
    },
    {
      icon: <Award size={18} />,
      label: "Experience",
      value: experienceLabels[data.experience] || data.experience,
      tone: "ready",
    },
    {
      icon: <Layers size={18} />,
      label: "Interests",
      value: `${data.interests.length} topic${data.interests.length !== 1 ? "s" : ""} selected`,
      tone: "enrich",
    },
    {
      icon: <Clock size={18} />,
      label: "Commitment",
      value: scheduleLabels[data.weeklyHours] || data.weeklyHours,
      tone: "proc",
    },
  ];

  const handleComplete = async () => {
    setError("");
    const result = await submitOnboarding(data);
    if (!result.ok) setError(result.error.message || "Something went wrong");
  };

  return (
    <OnboardingCard
      icon={<CheckCircle2 size={32} />}
      title="You're all set!"
      subtitle="Here's a summary of your preferences. Ready to start your journey?"
      nextLabel={isLoading ? "Setting up..." : "Start Learning"}
      onNext={handleComplete}
      canProceed={!isLoading}
      showSkip={false}
      tone={ONBOARDING_STEP_TONE.complete}
    >
      <Stack spacing={1.5}>
        {summaryItems.map((item, index) => {
          const accent = resolveAccent(item.tone, undefined);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: aurora.radii.md,
                  background: auroraTint(accent, 0.07),
                  border: `1px solid ${auroraTint(accent, 0.22)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "background 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    background: auroraTint(accent, 0.13),
                    borderColor: auroraTint(accent, 0.35),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: aurora.radii.sm,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    background: `color-mix(in oklch, ${accent} 18%, ${aurora.surface2})`,
                    border: `1px solid ${auroraTint(accent, 0.3)}`,
                    color: accent,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      fontFamily: aurora.font.mono,
                      fontSize: "10.5px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: aurora.txLow,
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </Box>
                  <Box
                    sx={{
                      fontFamily: aurora.font.ui,
                      fontSize: "14px",
                      fontWeight: 500,
                      color: aurora.txHi,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value || "Not specified"}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <CircularProgress size={24} sx={{ color: aurora.teal }} />
          </Box>
        )}

        {error && (
          <Box
            sx={{
              mt: 1,
              fontFamily: aurora.font.ui,
              fontSize: "12.5px",
              color: aurora.status.fail,
            }}
          >
            {error}
          </Box>
        )}
      </Stack>
    </OnboardingCard>
  );
}
