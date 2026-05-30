"use client";

import { Suspense } from "react";
import { Box, Container } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ReviewSource } from "@sagepoint/domain";
import { Loader } from "@/shared/components";
import { ReviewView } from "@/features/review";

function isReviewSource(value: string | null): value is ReviewSource {
  return value === ReviewSource.DOCUMENT || value === ReviewSource.ROADMAP_STEP;
}

function ReviewPageContent() {
  const params = useSearchParams();
  const rawSource = params.get("source");
  const source = isReviewSource(rawSource) ? rawSource : undefined;
  const sourceId = source ? (params.get("sourceId") ?? undefined) : undefined;

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <ReviewView source={source} sourceId={sourceId} />
      </Container>
    </Box>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<Loader variant="page" message="Loading review" />}>
      <ReviewPageContent />
    </Suspense>
  );
}
