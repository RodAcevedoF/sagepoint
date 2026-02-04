"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Stack,
  alpha,
  CircularProgress,
} from "@mui/material";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { palette } from "@/common/theme";
import { Card } from "@/common/components/Card";
import { useOnboarding } from "../context/OnboardingContext";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  card: {
    p: { xs: 3, md: 5 },
    maxWidth: 520,
    position: "relative" as const,
  },
  skipButton: {
    color: palette.text.secondary,
    fontWeight: 500,
    "&:hover": {
      color: palette.text.primary,
      background: alpha(palette.primary.light, 0.05),
    },
  },
  progress: {
    height: 4,
    borderRadius: 2,
    bgcolor: alpha(palette.primary.light, 0.1),
    mb: 4,
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
    },
  },
  title: {
    fontWeight: 700,
    mb: 1,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.primary.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: palette.text.secondary,
    mb: 4,
  },
  navButton: {
    py: 1.5,
    px: 3,
    fontWeight: 600,
    borderRadius: 2,
  },
  primaryButton: {
    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
    boxShadow: `0 4px 14px 0 ${alpha(palette.primary.main, 0.39)}`,
    "&:hover": {
      background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 100%)`,
    },
  },
  backButton: {
    color: palette.text.secondary,
    borderColor: alpha(palette.text.secondary, 0.3),
    "&:hover": {
      borderColor: palette.text.primary,
      background: alpha(palette.primary.light, 0.05),
    },
  },
};

// ============================================================================
// Animation Variants
// ============================================================================

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3 } },
};

// ============================================================================
// Component
// ============================================================================

interface OnboardingCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  nextLabel?: string;
  onNext?: () => void;
  canProceed?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
}

export function OnboardingCard({
  icon,
  title,
  subtitle,
  children,
  nextLabel = "Continue",
  onNext,
  canProceed = true,
  showBack = true,
  showSkip = true,
}: OnboardingCardProps) {
  const { goNext, goBack, skip, isSkipping, currentStepIndex, totalSteps, isFirstStep } =
    useOnboarding();

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      goNext();
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card variant="glass" hoverable={false} sx={styles.card}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={styles.progress}
        />

        <motion.div variants={contentVariants} initial="initial" animate="animate">
          <Card.IconBox sx={{ width: 64, height: 64, mb: 3 }}>{icon}</Card.IconBox>

          <Typography variant="h4" sx={styles.title}>
            {title}
          </Typography>

          <Typography variant="body1" sx={styles.subtitle}>
            {subtitle}
          </Typography>

          <Box sx={{ minHeight: 180, mb: 4 }}>{children}</Box>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            {showBack && !isFirstStep ? (
              <Button
                variant="outlined"
                onClick={goBack}
                startIcon={<ArrowLeft size={18} />}
                sx={{ ...styles.navButton, ...styles.backButton }}
              >
                Back
              </Button>
            ) : (
              <Box />
            )}

            <Stack direction="row" spacing={1.5}>
              {showSkip && (
                <Button
                  variant="text"
                  onClick={skip}
                  disabled={isSkipping}
                  sx={styles.skipButton}
                >
                  {isSkipping ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    "Skip"
                  )}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed}
                endIcon={<ArrowRight size={18} />}
                sx={{ ...styles.navButton, ...styles.primaryButton }}
              >
                {nextLabel}
              </Button>
            </Stack>
          </Stack>
        </motion.div>
      </Card>
    </motion.div>
  );
}
