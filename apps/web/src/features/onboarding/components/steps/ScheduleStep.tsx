"use client";

import { Box } from "@mui/material";
import { Clock, Coffee, Zap, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";

const scheduleOptions: Array<{
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = [
  {
    id: "casual",
    icon: <Coffee size={24} />,
    title: "Casual",
    description: "1-3 hours per week",
    color: aurora.status.ready,
  },
  {
    id: "regular",
    icon: <Clock size={24} />,
    title: "Regular",
    description: "4-7 hours per week",
    color: aurora.status.concept,
  },
  {
    id: "dedicated",
    icon: <Zap size={24} />,
    title: "Dedicated",
    description: "8-14 hours per week",
    color: aurora.status.proc,
  },
  {
    id: "intensive",
    icon: <Flame size={24} />,
    title: "Intensive",
    description: "15+ hours per week",
    color: aurora.status.fail,
  },
];

export function ScheduleStep() {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingCard
      icon={<Clock size={32} />}
      title="Learning commitment"
      subtitle="How much time can you dedicate to learning each week?"
      canProceed={data.weeklyHours.length > 0}
      tone={ONBOARDING_STEP_TONE.schedule}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {scheduleOptions.map((option, index) => {
          const selected = data.weeklyHours === option.id;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Box
                onClick={() => updateData("weeklyHours", option.id)}
                sx={{
                  p: 3,
                  borderRadius: aurora.radii.md,
                  border: `1px solid ${selected ? auroraTint(option.color, 0.5) : aurora.line}`,
                  background: selected
                    ? auroraTint(option.color, 0.1)
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  "&:hover": {
                    borderColor: auroraTint(
                      option.color,
                      selected ? 0.6 : 0.35,
                    ),
                    background: auroraTint(
                      option.color,
                      selected ? 0.14 : 0.05,
                    ),
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
                    flexShrink: 0,
                    background: `color-mix(in oklch, ${option.color} 18%, ${aurora.surface2})`,
                    border: `1px solid ${auroraTint(option.color, 0.3)}`,
                    color: option.color,
                  }}
                >
                  {option.icon}
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
                    {option.title}
                  </Box>
                  <Box
                    sx={{
                      fontFamily: aurora.font.ui,
                      fontSize: "12.5px",
                      color: aurora.txMid,
                    }}
                  >
                    {option.description}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </OnboardingCard>
  );
}
