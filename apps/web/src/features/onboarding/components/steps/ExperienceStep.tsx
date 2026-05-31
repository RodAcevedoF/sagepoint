"use client";

import { Box } from "@mui/material";
import { Award, Sprout, Flame, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";

const experienceLevels: Array<{
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = [
  {
    id: "beginner",
    icon: <Sprout size={24} />,
    title: "Beginner",
    description: "Just starting out",
    color: aurora.difficulty.beginner,
  },
  {
    id: "intermediate",
    icon: <Flame size={24} />,
    title: "Intermediate",
    description: "Some experience",
    color: aurora.difficulty.intermediate,
  },
  {
    id: "advanced",
    icon: <Award size={24} />,
    title: "Advanced",
    description: "Solid foundation",
    color: aurora.difficulty.advanced,
  },
  {
    id: "expert",
    icon: <Rocket size={24} />,
    title: "Expert",
    description: "Deep expertise",
    color: aurora.difficulty.expert,
  },
];

export function ExperienceStep() {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingCard
      icon={<Award size={32} />}
      title="Your experience level"
      subtitle="This helps us recommend content that matches your current knowledge."
      canProceed={data.experience.length > 0}
      tone={ONBOARDING_STEP_TONE.experience}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
        }}
      >
        {experienceLevels.map((level, index) => {
          const selected = data.experience === level.id;
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Box
                onClick={() => updateData("experience", level.id)}
                sx={{
                  p: 2.5,
                  borderRadius: aurora.radii.md,
                  border: `1px solid ${selected ? auroraTint(level.color, 0.5) : aurora.line}`,
                  background: selected
                    ? auroraTint(level.color, 0.1)
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: auroraTint(level.color, selected ? 0.6 : 0.35),
                    background: auroraTint(level.color, selected ? 0.14 : 0.05),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: aurora.radii.sm,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                    background: `color-mix(in oklch, ${level.color} 18%, ${aurora.surface2})`,
                    border: `1px solid ${auroraTint(level.color, 0.3)}`,
                    color: level.color,
                  }}
                >
                  {level.icon}
                </Box>
                <Box
                  sx={{
                    fontFamily: aurora.font.ui,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: aurora.txHi,
                  }}
                >
                  {level.title}
                </Box>
                <Box
                  sx={{
                    fontFamily: aurora.font.ui,
                    fontSize: "12.5px",
                    color: aurora.txMid,
                  }}
                >
                  {level.description}
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </OnboardingCard>
  );
}
