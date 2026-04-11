"use client";

import { Box, Container } from "@mui/material";
import { ExploreRoadmaps } from "@/features/roadmap/components/ExploreRoadmaps";
import { LearningCTA } from "@/shared/components";

export default function ExplorePage() {
  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <ExploreRoadmaps />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </Box>
  );
}
