"use client";

import { Box, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";
import { palette } from "@/common/theme";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  root: {
    mb: 4,
  },
  greeting: {
    fontWeight: 700,
    mb: 1,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.primary.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
};

// ============================================================================
// Helpers
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ============================================================================
// Component
// ============================================================================

interface DashboardGreetingProps {
  userName: string;
  stepsCompleted?: number;
}

export function DashboardGreeting({
  userName,
  stepsCompleted = 0,
}: DashboardGreetingProps) {
  const greeting = getGreeting();
  const firstName = userName.split(" ")[0];

  return (
    <Box sx={styles.root}>
      <Typography variant="h3" sx={styles.greeting}>
        {greeting}, {firstName}!
      </Typography>
      <Typography variant="body1" sx={styles.subtitle}>
        {stepsCompleted > 0 ? (
          <>
            <Sparkles size={18} style={{ color: palette.primary.light }} />
            You&apos;ve completed {stepsCompleted} steps so far. Keep it up!
          </>
        ) : (
          "Ready to continue your learning journey?"
        )}
      </Typography>
    </Box>
  );
}
