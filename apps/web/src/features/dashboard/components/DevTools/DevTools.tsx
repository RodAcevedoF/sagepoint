"use client";

import { Box, Button, CircularProgress, alpha, useTheme } from "@mui/material";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useResetOnboardingMutation } from "@/infrastructure/api/userApi";

export function DevTools() {
  const router = useRouter();
  const theme = useTheme();
  const [resetOnboarding, { isLoading }] = useResetOnboardingMutation();

  if (process.env.NODE_ENV !== "development") return null;

  const handleReset = async () => {
    try {
      await resetOnboarding().unwrap();
      router.push("/onboarding");
    } catch {
      // mutation error is surfaced by RTK Query
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        p: 2,
        borderRadius: 2,
        border: `1px dashed ${alpha(theme.palette.warning.main, 0.5)}`,
        bgcolor: alpha(theme.palette.warning.main, 0.05),
      }}
    >
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={
          isLoading ? <CircularProgress size={16} /> : <RotateCcw size={16} />
        }
        onClick={handleReset}
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Reset Onboarding (Dev)"}
      </Button>
    </Box>
  );
}
