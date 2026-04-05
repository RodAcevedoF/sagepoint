"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { GraduationCap, BookOpen, Lightbulb, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { Card } from "@/common/components/Card";
import { OnboardingCard } from "../OnboardingCard";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  featureCard: (accentColor: string) => ({
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
    width: 40,
    height: 40,
    background: alpha(accentColor, 0.15),
    border: `1px solid ${alpha(accentColor, 0.3)}`,
  }),
  title: {
    fontWeight: 600,
    color: palette.text.primary,
  },
  description: {
    color: palette.text.secondary,
  },
};

// ============================================================================
// Data
// ============================================================================

const features = [
  {
    icon: <Lightbulb size={20} />,
    title: "Personalized Learning Paths",
    description: "Tailored to your goals",
    color: palette.warning.light,
  },
  {
    icon: <BookOpen size={20} />,
    title: "Smart Recommendations",
    description: "AI-powered content curation",
    color: palette.info.light,
  },
  {
    icon: <Zap size={20} />,
    title: "Track Your Progress",
    description: "Visualize your journey",
    color: palette.experience.expert,
  },
];

// ============================================================================
// Component
// ============================================================================

export function WelcomeStep() {
  return (
    <OnboardingCard
      icon={<GraduationCap size={32} color={palette.primary.light} />}
      title="Welcome to SagePoint"
      subtitle="Let's personalize your learning experience in just a few steps."
      nextLabel="Get Started"
      showBack={false}
    >
      <Stack spacing={2}>
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Box sx={styles.featureCard(feature.color)}>
              <Card.IconBox sx={styles.iconBox(feature.color)}>
                {/* Clone icon with the per-feature color */}
                <Box sx={{ color: feature.color, display: "flex" }}>
                  {feature.icon}
                </Box>
              </Card.IconBox>
              <Box>
                <Typography variant="subtitle2" sx={styles.title}>
                  {feature.title}
                </Typography>
                <Typography variant="caption" sx={styles.description}>
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Stack>
    </OnboardingCard>
  );
}
