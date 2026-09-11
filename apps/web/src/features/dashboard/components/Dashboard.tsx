"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { useRoadmapEvents } from "@/shared/hooks";
import { OnboardingRoadmapReveal } from "@/features/onboarding";
import { DevTools } from "./DevTools";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useUserRoadmapsQuery } from "@/application/roadmap/queries/get-user-roadmaps.query";
import { useUserDocumentsQuery } from "@/application/document";

import { DashboardReviewChip } from "@/features/review";
import { DashboardLayout } from "./DashboardLayout";
import { DashboardGreeting } from "./DashboardGreeting";
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

const stackSx = {
  display: "flex",
  flexDirection: "column",
  gap: { xs: "22px", md: "30px" },
} as const;

const splitRowSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1.25fr 1fr" },
  gap: { xs: "22px", md: "22px" },
  alignItems: "stretch",
} as const;

export function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.replace("/dashboard", { scroll: false });
    }
  }, [
    isCreatingFirstRoadmap,
    sseStatus,
    creatingRoadmap?.roadmap.generationStatus,
    refetchRoadmaps,
    router,
  ]);

  useEffect(() => {
    if (isCreatingFirstRoadmap && !creatingRoadmapId && roadmaps?.length) {
      const hasCompleted = roadmaps.some(
        (r) => r.roadmap.generationStatus === "completed",
      );
      if (hasCompleted) {
        router.replace("/dashboard", { scroll: false });
      }
    }
  }, [isCreatingFirstRoadmap, creatingRoadmapId, roadmaps, router]);

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

  if (isLoadingRoadmaps || isLoadingDocuments) {
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
  const roadmapItems = computeRoadmaps(userRoadmaps);
  const roadmapsOverview = computeRoadmapsOverview(userRoadmaps);
  const insights = computeInsights(userRoadmaps);

  const hasRoadmaps = userRoadmaps.length > 0;

  return (
    <DashboardLayout>
      <Box sx={stackSx}>
        <DashboardGreeting userName={userName} metrics={metrics} />

        <DashboardReviewChip />

        {hasRoadmaps ? (
          <>
            <DashboardQuickActions />
            <DashboardRoadmaps
              roadmaps={roadmapItems}
              overview={roadmapsOverview}
              allRoadmaps={userRoadmaps}
              onRoadmapComplete={refetchRoadmaps}
            />

            <DashboardActivityHeatmap />

            <Box sx={splitRowSx}>
              <DashboardRecentDocuments documents={userDocuments} />
              <DashboardInsights
                data={insights}
                overallProgress={metrics.overallProgress}
                metrics={metrics}
              />
            </Box>

            <DashboardNews />

            <DevTools />
          </>
        ) : (
          <>
            <DashboardHeroCTA />
            <DashboardQuickActions />
            <DashboardNews />
            <DevTools />
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}
