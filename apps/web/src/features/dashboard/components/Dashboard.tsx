"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid } from "@mui/material";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { useWatchGenerationCommand } from "@/application/roadmap";
import { useSnackbar, Loader } from "@/shared/components";
import { DevTools } from "./DevTools";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useUserRoadmapsQuery } from "@/application/roadmap/queries/get-user-roadmaps.query";
import { useUserDocumentsQuery } from "@/application/document";

import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardProgress } from "./DashboardProgress";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardRecentDocuments } from "./DashboardRecentDocuments";
import { DashboardInsights } from "./DashboardInsights";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardNews } from "./DashboardNews";
import { DashboardHeroCTA } from "./DashboardHeroCTA";

import {
  computeMetrics,
  computeRoadmapProgress,
  computeRecentRoadmaps,
  computeInsights,
} from "../utils/dashboard.utils";

export function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const user = useCurrentUser();

  const isCreatingFirstRoadmap = searchParams.get("creating") === "roadmap";
  const creatingRoadmapId = searchParams.get("roadmapId");

  const { status: sseStatus } = useWatchGenerationCommand(
    isCreatingFirstRoadmap ? creatingRoadmapId : null,
  );

  const {
    data: roadmaps,
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
  } = useUserRoadmapsQuery();

  const { data: documents, isLoading: isLoadingDocuments } =
    useUserDocumentsQuery();

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

  if (isLoadingRoadmaps || isLoadingDocuments) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (isCreatingFirstRoadmap) {
    return (
      <DashboardLayout>
        <Loader variant="page" message="Creating your first roadmap..." />
      </DashboardLayout>
    );
  }

  const userName = user?.name || "Learner";
  const userRoadmaps = roadmaps ?? [];
  const userDocuments = documents?.data ?? [];

  const metrics = computeMetrics(userRoadmaps);
  const progressItems = computeRoadmapProgress(userRoadmaps);
  const recentRoadmaps = computeRecentRoadmaps(userRoadmaps);
  const insights = computeInsights(userRoadmaps);

  const hasRoadmaps = userRoadmaps.length > 0;

  return (
    <DashboardLayout>
      <DashboardGreeting
        userName={userName}
        stepsCompleted={metrics.totalStepsCompleted}
      />

      {!hasRoadmaps && <DashboardHeroCTA />}

      <DashboardMetrics metrics={metrics} />

      {hasRoadmaps ? (
        <Grid container spacing={3}>
          {/* Row 1 — Progress & Activity */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardProgress data={progressItems} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardActivity
              roadmaps={recentRoadmaps}
              onRoadmapComplete={refetchRoadmaps}
            />
          </Grid>

          {/* Row 2 — Documents (7/12) & Insights (5/12) */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex" }}>
            <DashboardRecentDocuments documents={userDocuments} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex" }}>
            <DashboardInsights
              data={insights}
              overallProgress={metrics.overallProgress}
            />
          </Grid>

          {/* Row 3 — News */}
          <Grid size={{ xs: 12 }}>
            <DashboardNews />
          </Grid>

          {/* Row 4 — Quick Actions */}
          <Grid size={{ xs: 12 }}>
            <DashboardQuickActions />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DevTools />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DashboardNews />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DashboardQuickActions />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DevTools />
          </Grid>
        </Grid>
      )}
    </DashboardLayout>
  );
}
