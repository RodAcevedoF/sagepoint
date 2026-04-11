"use client";

import { Box, Container } from "@mui/material";
import { NewsFeed } from "@/features/feed/components/NewsFeed";

export default function FeedPage() {
  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <NewsFeed />
      </Container>
    </Box>
  );
}
