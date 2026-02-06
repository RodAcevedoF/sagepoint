"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, CircularProgress, Box, Button, alpha } from "@mui/material";
import { RotateCcw } from "lucide-react";
import { useAppSelector } from "@/common/hooks";
import { useSnackbar } from "@/common/components";
import { useGetProfileQuery } from "@/infrastructure/api/authApi";
import { palette } from "@/common/theme";

import { DashboardAppBar } from "@/common/components";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardProgress } from "./DashboardProgress";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardNews } from "./DashboardNews";
import { DashboardTopics } from "./DashboardTopics";

import {
  mockUserMetrics,
  mockProgressData,
  mockRecentActivities,
  mockNews,
  mockTopicDistribution,
} from "../data/dashboard.mock";

// ============================================================================
// Component
// ============================================================================

export function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const { user } = useAppSelector((state) => state.auth);
  const [isResetting, setIsResetting] = useState(false);

  // Refetch profile to get latest onboarding status
  const { isLoading: isLoadingProfile, refetch } = useGetProfileQuery();

  // Show login success toast (ref prevents double-firing in StrictMode)
  const toastShown = useRef(false);
  useEffect(() => {
    if (searchParams.get("login") === "success" && !toastShown.current) {
      toastShown.current = true;
      showSnackbar("Welcome back!", { severity: "success" });
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, showSnackbar, router]);

  // Dev only: Reset onboarding status
  const handleResetOnboarding = async () => {
    setIsResetting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/me/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies for auth
        body: JSON.stringify({ status: "PENDING" }),
      });
      await refetch();
      router.push("/onboarding");
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Redirect to onboarding if not completed/skipped
  useEffect(() => {
    if (isLoadingProfile) return;
    // Default to PENDING if onboardingStatus is undefined (for existing users)
    const status = user?.onboardingStatus ?? "PENDING";
    if (user && status === "PENDING") {
      router.push("/onboarding");
    }
  }, [user, router, isLoadingProfile]);

  if (isLoadingProfile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isDev = process.env.NODE_ENV === "development";

  const userName = user?.name || "Learner";

  return (
    <DashboardLayout>
      {/* Greeting */}
      <DashboardGreeting
        userName={userName}
        streak={mockUserMetrics.currentStreak}
      />

      {/* Metrics Row */}
      <DashboardMetrics metrics={mockUserMetrics} />

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Progress & Activity */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DashboardProgress data={mockProgressData} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DashboardActivity activities={mockRecentActivities} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Topics */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardTopics distribution={mockTopicDistribution} />
        </Grid>

        {/* Full Width - News */}
        <Grid size={{ xs: 12 }}>
          <DashboardNews news={mockNews} />
        </Grid>

        {/* Dev Tools */}
        {isDev && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                mt: 4,
                p: 2,
                borderRadius: 2,
                border: `1px dashed ${alpha(palette.warning.main, 0.5)}`,
                bgcolor: alpha(palette.warning.main, 0.05),
              }}
            >
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={isResetting ? <CircularProgress size={16} /> : <RotateCcw size={16} />}
                onClick={handleResetOnboarding}
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Reset Onboarding (Dev)"}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Floating App Bar */}
      <DashboardAppBar />
    </DashboardLayout>
  );
}
