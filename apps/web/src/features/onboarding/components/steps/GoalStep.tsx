"use client";

import { TextField, Box, Chip, Stack } from "@mui/material";
import {
  Target,
  Briefcase,
  Code,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";

const suggestions = [
  { icon: <Code size={16} />, label: "Become a Senior Developer" },
  { icon: <Briefcase size={16} />, label: "Switch to Tech Career" },
  { icon: <Lightbulb size={16} />, label: "Learn AI & Machine Learning" },
  { icon: <GraduationCap size={16} />, label: "Master Cloud Architecture" },
];

export function GoalStep() {
  const { data, updateData } = useOnboarding();

  const handleSuggestionClick = (suggestion: string) => {
    updateData("goal", suggestion);
  };

  return (
    <OnboardingCard
      icon={<Target size={32} />}
      title="What's your goal?"
      subtitle="Tell us what you want to achieve. This helps us create your personalized learning path."
      canProceed={data.goal.length > 0}
      tone={ONBOARDING_STEP_TONE.goal}
    >
      <Box>
        <TextField
          fullWidth
          placeholder="e.g., Become a Full-Stack Developer"
          value={data.goal}
          onChange={(e) => updateData("goal", e.target.value)}
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: aurora.radii.md,
              background: aurora.surface,
              color: aurora.txHi,
              fontFamily: aurora.font.ui,
              "& fieldset": { borderColor: aurora.line },
              "&:hover": {
                background: aurora.surface2,
                "& fieldset": { borderColor: aurora.line2 },
              },
              "&.Mui-focused": {
                background: aurora.surface2,
                boxShadow: `0 0 0 4px ${auroraTint(aurora.teal, 0.18)}`,
                "& fieldset": { borderColor: aurora.teal },
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: aurora.txLow,
              opacity: 1,
            },
          }}
        />

        <Box
          sx={{
            mt: 3,
            mb: 1.5,
            fontFamily: aurora.font.mono,
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: aurora.txLow,
          }}
        >
          Or choose a suggestion
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {suggestions.map((suggestion, index) => {
            const selected = data.goal === suggestion.label;
            return (
              <motion.div
                key={suggestion.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Chip
                  icon={suggestion.icon}
                  label={suggestion.label}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => handleSuggestionClick(suggestion.label)}
                  sx={{
                    py: 2.25,
                    px: 0.5,
                    borderRadius: aurora.radii.sm,
                    fontFamily: aurora.font.ui,
                    fontWeight: 500,
                    color: selected ? aurora.tealInk : aurora.txMid,
                    borderColor: aurora.line,
                    background: selected
                      ? `linear-gradient(135deg, ${aurora.teal}, ${aurora.tealDeep})`
                      : "transparent",
                    "& .MuiChip-icon": {
                      color: selected ? aurora.tealInk : aurora.txMid,
                    },
                    "&:hover": {
                      borderColor: aurora.teal,
                      background: selected
                        ? `linear-gradient(135deg, ${aurora.teal}, ${aurora.tealDeep})`
                        : auroraTint(aurora.teal, 0.08),
                      filter: selected ? "brightness(1.05)" : "none",
                    },
                  }}
                />
              </motion.div>
            );
          })}
        </Stack>
      </Box>
    </OnboardingCard>
  );
}
