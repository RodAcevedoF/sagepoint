"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid, Box } from "@mui/material";
import { useAppSelector } from "@/common/hooks";
import { useWatchGenerationCommand } from "@/application/roadmap";
import { useSnackbar, Loader, EmptyState, DevTools } from "@/common/components";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useProfileQuery } from "@/application/auth/queries/get-profile.query";
import { useUserRoadmapsQuery } from "@/application/roadmap/queries/get-user-roadmaps.query";
import { useUserDocumentsQuery } from "@/application/document";

import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardProgress } from "./DashboardProgress";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardRecentDocuments } from "./DashboardRecentDocuments";
import { DashboardTopics } from "./DashboardTopics";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardNews } from "./DahsboardNews";

import {
  computeMetrics,
  computeRoadmapProgress,
  computeRecentRoadmaps,
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

  // Refetch profile to get latest onboarding status
  const { isLoading: isLoadingProfile } = useProfileQuery();

  const isCreatingFirstRoadmap = searchParams.get("creating") === "roadmap";
  const creatingRoadmapId = searchParams.get("roadmapId");

  // SSE for first roadmap creation status
  const { status: sseStatus } = useWatchGenerationCommand(
    isCreatingFirstRoadmap ? creatingRoadmapId : null,
  );

  // Fetch real roadmap data
  const {
    data: roadmaps,
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
  } = useUserRoadmapsQuery();

  // Fetch documents
  const { data: documents, isLoading: isLoadingDocuments } =
    useUserDocumentsQuery();

  // Show login success toast (ref prevents double-firing in StrictMode)
  const toastShown = useRef(false);
  useEffect(() => {
    if (searchParams.get("login") === "success" && !toastShown.current) {
      toastShown.current = true;
      showSnackbar("Welcome back!", { severity: "success" });
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, showSnackbar, router]);

  // Redirect to onboarding if not completed/skipped
  useEffect(() => {
    if (isLoadingProfile) return;
    if (isCreatingFirstRoadmap) return; // Skip when coming from onboarding
    // Default to PENDING if onboardingStatus is undefined (for existing users)
    const status = user?.onboardingStatus ?? "PENDING";
    if (user && status === "PENDING") {
      router.push("/onboarding");
    }
  }, [user, router, isLoadingProfile, isCreatingFirstRoadmap]);

  // When SSE says roadmap is completed, refetch and clear the param
  useEffect(() => {
    if (isCreatingFirstRoadmap && sseStatus === "completed") {
      refetchRoadmaps();
      showSnackbar("Your first roadmap is ready!", { severity: "success" });
      router.replace("/dashboard", { scroll: false });
    }
  }, [
    isCreatingFirstRoadmap,
    sseStatus,
    refetchRoadmaps,
    router,
    showSnackbar,
  ]);

  // Fallback: if no SSE (no roadmapId), detect when skeleton roadmap becomes completed
  useEffect(() => {
    if (isCreatingFirstRoadmap && !creatingRoadmapId && roadmaps?.length) {
      const hasCompleted = roadmaps.some(
        (r) => r.roadmap.generationStatus === "completed",
      );
      if (hasCompleted) {
        showSnackbar("Your first roadmap is ready!", { severity: "success" });
        router.replace("/dashboard", { scroll: false });
      }
    }
  }, [
    isCreatingFirstRoadmap,
    creatingRoadmapId,
    roadmaps,
    router,
    showSnackbar,
  ]);

  if (isLoadingProfile || isLoadingRoadmaps || isLoadingDocuments) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const userName = user?.name || "Learner";
  const userRoadmaps = roadmaps ?? [];
  const userDocuments = documents?.data ?? [];

  const metrics = computeMetrics(userRoadmaps);
  const progressItems = computeRoadmapProgress(userRoadmaps);
  const recentRoadmaps = computeRecentRoadmaps(userRoadmaps);
  const difficultyDistribution = computeDifficultyDistribution(userRoadmaps);

  // Only count completed roadmaps for the "has content" check
  const hasCompletedRoadmaps = userRoadmaps.some(
    (r) => r.roadmap.generationStatus === "completed",
  );
  const hasDocuments = userDocuments.length > 0;

  return (
    <DashboardLayout>
      {/* Greeting */}
      <DashboardGreeting
        userName={userName}
        stepsCompleted={metrics.totalStepsCompleted}
      />

      {/* Metrics Row */}
      <DashboardMetrics metrics={metrics} />

      {hasCompletedRoadmaps ? (
        <Grid container spacing={3}>
          {/* Left Column - Progress & Activity */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardProgress data={progressItems} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DashboardActivity
                  roadmaps={recentRoadmaps}
                  onRoadmapComplete={refetchRoadmaps}
                />
              </Grid>
              {hasDocuments && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <DashboardRecentDocuments documents={userDocuments} />
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Right Column - Difficulty Distribution */}
          {difficultyDistribution.length > 0 && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <DashboardTopics
                distribution={difficultyDistribution}
                overallProgress={metrics.overallProgress}
              />
            </Grid>
          )}

          {/* News — driven by user interests from onboarding */}
          <Grid size={{ xs: 12 }}>
            <DashboardNews />
          </Grid>

          {/* Full Width - Quick Actions */}
          <Grid size={{ xs: 12 }}>
            <DashboardQuickActions />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DevTools />
          </Grid>
        </Grid>
      ) : isCreatingFirstRoadmap ? (
        <Loader variant="page" message="Creating your first roadmap..." />
      ) : (
        <>
          <EmptyState
            title="No roadmaps yet"
            description="Create your first learning roadmap to get started"
            actionLabel="Create Roadmap"
            onAction={() => router.push("/roadmaps/create")}
          />
          <Box sx={{ mt: 3 }}>
            <DashboardNews />
          </Box>
          <DevTools />
        </>
      )}
    </DashboardLayout>
  );
}
