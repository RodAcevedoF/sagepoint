"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button as MuiButton,
  CircularProgress,
  LinearProgress,
  Stack,
} from "@mui/material";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ButtonVariants, ButtonIconPositions } from "@/shared/types";
import {
  resolveAccent,
  type AuroraTone,
} from "@/shared/components/ui/Aurora/tones";
import { useOnboarding } from "../context/OnboardingContext";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.2, duration: 0.3 } },
};

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
  tone?: AuroraTone;
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
  tone = "teal",
}: OnboardingCardProps) {
  const {
    goNext,
    goBack,
    skip,
    isSkipping,
    currentStepIndex,
    totalSteps,
    isFirstStep,
  } = useOnboarding();

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  const accent = resolveAccent(tone, undefined);

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
      <Card
        variant="aurora"
        hoverable={false}
        withAura={false}
        sx={{ p: { xs: 3, md: 5 }, maxWidth: 520, position: "relative" }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: aurora.radii.sm,
              mb: 4,
              backgroundColor: auroraTint(aurora.teal, 0.1),
              "& .MuiLinearProgress-bar": {
                borderRadius: aurora.radii.sm,
                background: `linear-gradient(90deg, ${aurora.teal}, ${aurora.tealDeep})`,
              },
            }}
          />

          <motion.div
            variants={contentVariants}
            initial="initial"
            animate="animate"
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: aurora.radii.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `color-mix(in oklch, ${accent} 18%, ${aurora.surface2})`,
                border: `1px solid ${auroraTint(accent, 0.3)}`,
                color: accent,
                boxShadow: `0 0 38px -8px ${auroraTint(accent, 0.5)}`,
                mb: 3,
              }}
            >
              {icon}
            </Box>

            <Box
              component="h1"
              sx={{
                fontFamily: aurora.font.display,
                fontWeight: 700,
                fontSize: { xs: "26px", md: "30px" },
                lineHeight: 1.15,
                letterSpacing: "-0.012em",
                margin: 0,
                mb: 1,
                background: `linear-gradient(135deg, ${aurora.txHi} 0%, ${accent} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </Box>

            <Box
              component="p"
              sx={{
                fontFamily: aurora.font.ui,
                fontSize: { xs: "14px", md: "15.5px" },
                lineHeight: 1.55,
                color: aurora.txMid,
                margin: 0,
                mb: 4,
              }}
            >
              {subtitle}
            </Box>

            <Box sx={{ minHeight: 180, mb: 4 }}>{children}</Box>

            <Stack direction="row" spacing={2} justifyContent="space-between">
              {showBack && !isFirstStep ? (
                <Button
                  variant={ButtonVariants.AURORA_OUTLINE}
                  onClick={goBack}
                  icon={ArrowLeft}
                  iconPos={ButtonIconPositions.START}
                  label="Back"
                  sx={{ py: 1.25, px: 2.5 }}
                />
              ) : (
                <Box />
              )}

              <Stack direction="row" spacing={1.5}>
                {showSkip && (
                  <MuiButton
                    onClick={skip}
                    disabled={isSkipping}
                    sx={{
                      color: aurora.txMid,
                      fontFamily: aurora.font.ui,
                      fontWeight: 500,
                      textTransform: "none",
                      "&:hover": {
                        color: aurora.txHi,
                        background: auroraTint(aurora.teal, 0.06),
                      },
                    }}
                  >
                    {isSkipping ? (
                      <CircularProgress size={18} sx={{ color: "inherit" }} />
                    ) : (
                      "Skip"
                    )}
                  </MuiButton>
                )}
                <Button
                  variant={ButtonVariants.AURORA}
                  onClick={handleNext}
                  disabled={!canProceed}
                  trailingIcon={ArrowRight}
                  label={nextLabel}
                  sx={{ py: 1.25, px: 2.5 }}
                />
              </Stack>
            </Stack>
          </motion.div>
        </Box>
      </Card>
    </motion.div>
  );
}
