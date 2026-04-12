"use client";

import { Box, Container } from "@mui/material";
import { RoadmapList } from "@/features/roadmap";
import { LearningCTA } from "@/shared/components";

export default function RoadmapsPage() {
  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <RoadmapList />
      </Container>
      <LearningCTA />
    </Box>
  );
}
