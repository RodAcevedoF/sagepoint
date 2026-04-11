"use client";

import { use } from "react";
import { Box, Container } from "@mui/material";
import { RoomDetail } from "@/features/category";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <Box sx={{ pt: 2, pb: 12 }}>
      <Container maxWidth="lg">
        <RoomDetail slug={slug} />
      </Container>
    </Box>
  );
}
