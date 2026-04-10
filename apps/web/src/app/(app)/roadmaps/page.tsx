"use client";

import { Box, Container } from "@mui/material";
import { RoadmapList } from "@/features/roadmap";
import { LearningCTA } from "@/shared/components";
import { Footer } from "@/shared/components/layout/Footer";

export default function RoadmapsPage() {
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
        <RoadmapList />
      </Container>
      <LearningCTA />
      <Footer />
    </Box>
  );
}
