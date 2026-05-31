"use client";

import { ExploreRoadmaps } from "@/features/roadmap/components/ExploreRoadmaps";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { LearningCTA } from "@/shared/components";

export default function ExplorePage() {
  return (
    <>
      <DashboardLayout width="lg">
        <ExploreRoadmaps />
      </DashboardLayout>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </>
  );
}
