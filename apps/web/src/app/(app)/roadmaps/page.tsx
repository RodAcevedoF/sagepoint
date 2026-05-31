"use client";

import { FileText, ArrowRight } from "lucide-react";
import { RoadmapList } from "@/features/roadmap";
import { FooterCTA, RootWrapper } from "@/shared/components";

export default function RoadmapsPage() {
  return (
    <RootWrapper>
      <RoadmapList />

      <FooterCTA
        style={{ marginTop: 48 }}
        title="Want to study your own materials?"
        body="Upload a document and turn it into a personalized roadmap."
        action={{
          label: "Browse Documents",
          icon: FileText,
          trailingIcon: ArrowRight,
          href: "/documents",
        }}
      />
    </RootWrapper>
  );
}
