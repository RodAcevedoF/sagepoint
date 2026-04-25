"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Container, Box, Toolbar } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";
import { OnboardingProvider } from "../context/OnboardingContext";

const Antigravity = dynamic(
  () =>
    import("@/shared/components/ui/animations/Antigravity").then(
      (m) => m.Antigravity,
    ),
  { ssr: false },
);

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    position: "relative" as const,
    zIndex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
  },
  content: {
    py: { xs: 4, md: 6 },
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
};

// ============================================================================
// Component
// ============================================================================

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <OnboardingProvider>
      <PublicLayout>
        <Antigravity
          count={300}
          magnetRadius={12}
          lerpSpeed={0.06}
          color={palette.primary.light}
          fieldStrength={8}
          particleSize={1.2}
        />
        <Toolbar />
        <Container component="main" maxWidth="sm" sx={styles.container}>
          <Box sx={styles.content}>
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </Box>
        </Container>
      </PublicLayout>
    </OnboardingProvider>
  );
}
