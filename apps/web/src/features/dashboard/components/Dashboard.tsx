"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, Box, Button, CircularProgress, alpha } from "@mui/material";
import { RotateCcw } from "lucide-react";
import { useAppSelector } from "@/common/hooks";
import { useSnackbar, Loader, EmptyState } from "@/common/components";
import { useGetProfileQuery } from "@/infrastructure/api/authApi";
import { useUserRoadmapsQuery } from "@/application/roadmap/queries/get-user-roadmaps.query";
import { palette } from "@/common/theme";

import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardProgress } from "./DashboardProgress";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardTopics } from "./DashboardTopics";
import { DashboardQuickActions } from "./DashboardQuickActions";

import {
  computeMetrics,
  computeRoadmapProgress,
  computeDifficultyDistribution,
} from "../utils/dashboard.utils";

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

  // Fetch real roadmap data
  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useUserRoadmapsQuery();

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

  if (isLoadingProfile || isLoadingRoadmaps) {
    return (
      <DashboardLayout>
        <Loader variant="page" message="Loading" />
      </DashboardLayout>
    );
  }

  const isDev = process.env.NODE_ENV === "development";
  const userName = user?.name || "Learner";
  const userRoadmaps = roadmaps ?? [];

  const metrics = computeMetrics(userRoadmaps);
  const progressItems = computeRoadmapProgress(userRoadmaps);
  const difficultyDistribution = computeDifficultyDistribution(userRoadmaps);

  const hasRoadmaps = userRoadmaps.length > 0;

  return (
    <DashboardLayout>
      {/* Greeting */}
      <DashboardGreeting
        userName={userName}
        stepsCompleted={metrics.totalStepsCompleted}
      />

      {/* Metrics Row */}
      <DashboardMetrics metrics={metrics} />

      {hasRoadmaps ? (
        <Grid container spacing={3}>
          {/* Left Column - Progress & Activity */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardProgress data={progressItems} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardActivity roadmaps={userRoadmaps} />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Difficulty Distribution */}
          {difficultyDistribution.length > 0 && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <DashboardTopics distribution={difficultyDistribution} />
            </Grid>
          )}

          {/* Full Width - Quick Actions */}
          <Grid size={{ xs: 12 }}>
            <DashboardQuickActions />
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
      ) : (
        <>
          <EmptyState
            title="No roadmaps yet"
            description="Create your first learning roadmap to get started"
            actionLabel="Create Roadmap"
            onAction={() => router.push("/roadmaps/create")}
          />
          {/* Dev Tools */}
          {isDev && (
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
          )}
        </>
      )}
    </DashboardLayout>
  );
}
