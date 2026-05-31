"use client";

import { use } from "react";
import { RootWrapper } from "@/shared/components";
import { DocumentDetail } from "@/features/document";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <RootWrapper>
      <DocumentDetail documentId={id} />
    </RootWrapper>
  );
}
