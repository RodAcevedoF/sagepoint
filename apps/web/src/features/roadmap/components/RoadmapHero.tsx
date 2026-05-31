"use client";

import { Sparkles, Route } from "lucide-react";
import { AuroraHero, useModal } from "@/shared/components";
import { CreateRoadmapModal } from "./CreateRoadmapModal/CreateRoadmapModal";

export function RoadmapHero() {
  const { openModal } = useModal();

  const handleCreate = () => {
    openModal(<CreateRoadmapModal />, {
      title: "Create Roadmap",
      showCloseButton: true,
      maxWidth: "sm",
    });
  };

  return (
    <AuroraHero
      eyebrow="AI Personalized Paths"
      eyebrowIcon={<Sparkles size={13} />}
      title="Your Learning Journey"
      lede="Master any skill through structured, data-driven roadmaps. From fundamental concepts to advanced mastery, Sagepoint guides every step of the way."
      cta={{
        label: "Create New Roadmap",
        icon: Sparkles,
        onClick: handleCreate,
      }}
      glyph={<Route size={140} strokeWidth={1.2} />}
    />
  );
}
