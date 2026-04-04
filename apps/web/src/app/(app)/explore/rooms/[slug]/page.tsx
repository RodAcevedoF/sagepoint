"use client";

import { use } from "react";
import { Box, Container } from "@mui/material";
import { RoomDetail } from "@/features/category";
import { Footer } from "@/common/components/Footer";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

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
        <RoomDetail slug={slug} />
      </Container>
      <Footer />
    </Box>
  );
}
