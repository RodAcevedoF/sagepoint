"use client";

import { ExploreRoadmaps } from "@/features/roadmap/components/ExploreRoadmaps";
import { LearningCTA, RootWrapper } from "@/shared/components";

export default function ExplorePage() {
  return (
    <>
      <RootWrapper>
        <ExploreRoadmaps />
      </RootWrapper>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </>
  );
}
