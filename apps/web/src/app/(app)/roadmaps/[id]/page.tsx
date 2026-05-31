"use client";

import { use } from "react";
import { RootWrapper } from "@/shared/components";
import { RoadmapDetail } from "@/features/roadmap";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoadmapDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <RootWrapper>
      <RoadmapDetail roadmapId={id} />
    </RootWrapper>
  );
}
