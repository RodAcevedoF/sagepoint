"use client";

import { Map, ArrowRight } from "lucide-react";
import { DocumentList } from "@/features/document";
import { FooterCTA, RootWrapper } from "@/shared/components";

export default function DocumentsPage() {
  return (
    <RootWrapper>
      <DocumentList />

      <FooterCTA
        style={{ marginTop: 48 }}
        title="Ready to keep learning?"
        body="Pick up where you left off or start a new roadmap."
        action={{
          label: "View Roadmaps",
          icon: Map,
          trailingIcon: ArrowRight,
          href: "/roadmaps",
        }}
      />
    </RootWrapper>
  );
}
