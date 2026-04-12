"use client";

import { Box, Container } from "@mui/material";
import { RoomGrid } from "@/features/category";
import { LearningCTA } from "@/shared/components";

export default function RoomsPage() {
  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <RoomGrid />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </Box>
  );
}
