"use client";

import { Box, Container } from "@mui/material";
import { ExploreRoadmaps } from "@/features/roadmap/components/ExploreRoadmaps";
import { LearningCTA } from "@/common/components";
import { Footer } from "@/common/components/Footer";

export default function ExplorePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1 }}>
        <ExploreRoadmaps />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
      <Footer />
    </Box>
  );
}
