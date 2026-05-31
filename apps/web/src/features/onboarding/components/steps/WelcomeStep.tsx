"use client";

import { Box, Stack } from "@mui/material";
import { GraduationCap, BookOpen, Lightbulb, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";
import { OnboardingCard } from "../OnboardingCard";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";

const features: Array<{
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: AuroraTone;
}> = [
  {
    icon: <Lightbulb size={20} />,
    title: "Personalized Learning Paths",
    description: "Tailored to your goals",
    tone: "ready",
  },
  {
    icon: <BookOpen size={20} />,
    title: "Smart Recommendations",
    description: "AI-powered content curation",
    tone: "concept",
  },
  {
    icon: <Zap size={20} />,
    title: "Track Your Progress",
    description: "Visualize your journey",
    tone: "enrich",
  },
];

export function WelcomeStep() {
  return (
    <OnboardingCard
      icon={<GraduationCap size={32} />}
      title="Welcome to SagePoint"
      subtitle="Let's personalize your learning experience in just a few steps."
      nextLabel="Get Started"
      showBack={false}
      tone={ONBOARDING_STEP_TONE.welcome}
    >
      <Stack spacing={2}>
        {features.map((feature, index) => {
          const accent = resolveAccent(feature.tone, undefined);
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
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
                    width: 40,
                    height: 40,
                    borderRadius: aurora.radii.sm,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `color-mix(in oklch, ${accent} 18%, ${aurora.surface2})`,
                    border: `1px solid ${auroraTint(accent, 0.3)}`,
                    color: accent,
                    flex: "none",
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Box
                    sx={{
                      fontFamily: aurora.font.ui,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: aurora.txHi,
                    }}
                  >
                    {feature.title}
                  </Box>
                  <Box
                    sx={{
                      fontFamily: aurora.font.ui,
                      fontSize: "12.5px",
                      color: aurora.txMid,
                    }}
                  >
                    {feature.description}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Stack>
    </OnboardingCard>
  );
}
