"use client";

import { Box, Container } from "@mui/material";
import { DocumentList } from "@/features/document";
import { LearningCTA } from "@/shared/components";
import { Footer } from "@/shared/components/layout/Footer";

export default function DocumentsPage() {
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
        <DocumentList />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
      <Footer />
    </Box>
  );
}
