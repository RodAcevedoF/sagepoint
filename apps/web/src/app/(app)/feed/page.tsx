"use client";

import { Box, Container } from "@mui/material";
import { NewsFeed } from "@/features/feed/components/NewsFeed";
import { Footer } from "@/shared/components/layout/Footer";

export default function FeedPage() {
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
        <NewsFeed />
      </Container>
      <Footer />
    </Box>
  );
}
