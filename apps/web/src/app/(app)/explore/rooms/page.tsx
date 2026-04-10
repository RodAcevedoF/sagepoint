"use client";

import { Box, Container } from "@mui/material";
import { RoomGrid } from "@/features/category";
import { LearningCTA } from "@/shared/components";
import { Footer } from "@/shared/components/layout/Footer";

export default function RoomsPage() {
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
        <RoomGrid />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
      <Footer />
    </Box>
  );
}
