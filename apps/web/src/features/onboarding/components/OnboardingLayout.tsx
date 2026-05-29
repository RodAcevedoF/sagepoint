"use client";

import { type ReactNode } from "react";
import { Container, Box, Toolbar } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { OnboardingProvider } from "../context/OnboardingContext";

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
      <Toolbar />
      <Container component="main" maxWidth="sm" sx={styles.container}>
        <Box sx={styles.content}>
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </Box>
      </Container>
    </OnboardingProvider>
  );
}
