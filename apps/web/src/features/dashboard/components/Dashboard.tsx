"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Grid } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { useRoadmapEvents } from "@/shared/hooks";
import { useSnackbar } from "@/shared/components";
import { OnboardingRoadmapReveal } from "@/features/onboarding";
import { DevTools } from "./DevTools";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useUserRoadmapsQuery } from "@/application/roadmap/queries/get-user-roadmaps.query";
import { useUserDocumentsQuery } from "@/application/document";

import { DashboardReviewChip } from "@/features/review";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
import { DashboardMetrics } from "./DashboardMetrics";
import { DashboardRoadmaps } from "./DashboardRoadmaps/DashboardRoadmaps";
import { DashboardRecentDocuments } from "./DashboardRecentDocuments";
import { DashboardInsights } from "./DashboardInsights";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardNews } from "./DashboardNews";
import { DashboardHeroCTA } from "./DashboardHeroCTA";
import { DashboardActivityHeatmap } from "./DashboardHeatmap/DashboardActivityHeatmap";

import {
  computeMetrics,
  computeRoadmaps,
  computeRoadmapsOverview,
  computeInsights,
} from "../utils/dashboard.utils";

export function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const user = useCurrentUser();

  const isCreatingFirstRoadmap = searchParams.get("creating") === "roadmap";
  const creatingRoadmapId = searchParams.get("roadmapId");

  const { status: sseStatus, stage: sseStage } = useRoadmapEvents(
    isCreatingFirstRoadmap ? creatingRoadmapId : null,
  );

  const {
    data: roadmaps,
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
  } = useUserRoadmapsQuery();

  const creatingRoadmap = creatingRoadmapId
    ? roadmaps?.find((r) => r.roadmap.id === creatingRoadmapId)
    : undefined;

  const phaseOneDone =
    sseStage === "resources" ||
    sseStage === "done" ||
    sseStatus === "completed" ||
    creatingRoadmap?.roadmap.generationStatus === "completed";

  const { data: documents, isLoading: isLoadingDocuments } =
    useUserDocumentsQuery();

  useEffect(() => {
    if (
      isCreatingFirstRoadmap &&
      (sseStatus === "completed" ||
        creatingRoadmap?.roadmap.generationStatus === "completed")
    ) {
      refetchRoadmaps();
      showSnackbar("Your first roadmap is ready!", { severity: "success" });
      router.replace("/dashboard", { scroll: false });
    }
  }, [
    isCreatingFirstRoadmap,
    sseStatus,
    creatingRoadmap?.roadmap.generationStatus,
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

  if (isCreatingFirstRoadmap && !phaseOneDone) {
    return (
      <DashboardLayout>
        <AnimatePresence mode="wait">
          <OnboardingRoadmapReveal
            key="onboarding-reveal"
            topic={creatingRoadmap?.roadmap.title ?? ""}
            sseStage={sseStage}
          />
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  const userName = user?.name || "Learner";
  const userRoadmaps = roadmaps ?? [];
  const userDocuments = documents?.data ?? [];

  const metrics = computeMetrics(userRoadmaps);
  const roadmapItems = computeRoadmaps(userRoadmaps);
  const roadmapsOverview = computeRoadmapsOverview(userRoadmaps);
  const insights = computeInsights(userRoadmaps);

  const hasRoadmaps = userRoadmaps.length > 0;

  return (
    <DashboardLayout>
      <DashboardGreeting
        userName={userName}
        stepsCompleted={metrics.totalStepsCompleted}
      />

      <Box sx={{ mb: 3 }}>
        <DashboardReviewChip />
      </Box>

      {!hasRoadmaps && <DashboardHeroCTA />}

      <DashboardMetrics metrics={metrics} />

      {hasRoadmaps ? (
        <Grid container spacing={3}>
          {/* Row 1 — Unified roadmaps panel */}
          <Grid size={{ xs: 12 }}>
            <DashboardRoadmaps
              roadmaps={roadmapItems}
              overview={roadmapsOverview}
              allRoadmaps={userRoadmaps}
              onRoadmapComplete={refetchRoadmaps}
            />
          </Grid>

          {/* Row 2 — Activity heatmap full-width */}
          <Grid size={{ xs: 12 }}>
            <DashboardActivityHeatmap />
          </Grid>

          {/* Row 3 — Documents (7/12) & Insights (5/12) */}
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
