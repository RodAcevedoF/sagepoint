"use client";

import { TextField, Box, Chip, Stack, Typography, alpha } from "@mui/material";
import { Target, Briefcase, Code, Lightbulb, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  suggestionChip: {
    py: 2.5,
    px: 1,
    borderRadius: 2,
    borderColor: alpha(palette.primary.light, 0.2),
    "&:hover": {
      borderColor: palette.primary.light,
      background: alpha(palette.primary.light, 0.1),
    },
    "&.MuiChip-filled": {
      background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.light})`,
      borderColor: "transparent",
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: palette.primary.light,
      },
    },
  },
};

// ============================================================================
// Data
// ============================================================================

const suggestions = [
  { icon: <Code size={16} />, label: "Become a Senior Developer" },
  { icon: <Briefcase size={16} />, label: "Switch to Tech Career" },
  { icon: <Lightbulb size={16} />, label: "Learn AI & Machine Learning" },
  { icon: <GraduationCap size={16} />, label: "Master Cloud Architecture" },
];

// ============================================================================
// Component
// ============================================================================

export function GoalStep() {
  const { data, updateData } = useOnboarding();

  const handleSuggestionClick = (suggestion: string) => {
    updateData("goal", suggestion);
  };

  return (
    <OnboardingCard
      icon={<Target size={32} color={palette.primary.light} />}
      title="What's your goal?"
      subtitle="Tell us what you want to achieve. This helps us create your personalized learning path."
      canProceed={data.goal.length > 0}
    >
      <Box>
        <TextField
          fullWidth
          placeholder="e.g., Become a Full-Stack Developer"
          value={data.goal}
          onChange={(e) => updateData("goal", e.target.value)}
          autoFocus
          sx={styles.textField}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, mb: 1.5, display: "block" }}
        >
          Or choose a suggestion:
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Chip
                icon={suggestion.icon}
                label={suggestion.label}
                variant={data.goal === suggestion.label ? "filled" : "outlined"}
                onClick={() => handleSuggestionClick(suggestion.label)}
                sx={styles.suggestionChip}
              />
            </motion.div>
          ))}
        </Stack>
      </Box>
    </OnboardingCard>
  );
}
