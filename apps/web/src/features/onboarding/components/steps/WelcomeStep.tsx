"use client";

import { Box, Typography, Stack, alpha } from "@mui/material";
import { Sparkles, BookOpen, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { Card } from "@/common/components/Card";
import { OnboardingCard } from "../OnboardingCard";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  featureCard: {
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
// Data
// ============================================================================

const features = [
  {
    icon: <Target size={20} color={palette.primary.light} />,
    title: "Personalized Learning Paths",
    description: "Tailored to your goals",
  },
  {
    icon: <BookOpen size={20} color={palette.primary.light} />,
    title: "Smart Recommendations",
    description: "AI-powered content curation",
  },
  {
    icon: <Zap size={20} color={palette.primary.light} />,
    title: "Track Your Progress",
    description: "Visualize your journey",
  },
];

// ============================================================================
// Component
// ============================================================================

export function WelcomeStep() {
  return (
    <OnboardingCard
      icon={<Sparkles size={32} color={palette.primary.light} />}
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
            <Box sx={styles.featureCard}>
              <Card.IconBox sx={{ width: 40, height: 40 }}>
                {feature.icon}
              </Card.IconBox>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
