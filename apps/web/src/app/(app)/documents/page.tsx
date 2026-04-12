"use client";

import { Box, Container } from "@mui/material";
import { DocumentList } from "@/features/document";
import { LearningCTA } from "@/shared/components";

export default function DocumentsPage() {
  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <DocumentList />
      </Container>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </Box>
  );
}
