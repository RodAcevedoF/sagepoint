"use client";

import { Compass, Globe } from "lucide-react";
import { AuroraHero } from "@/shared/components";

export function ExploreHero() {
  return (
    <AuroraHero
      eyebrow="Community"
      eyebrowIcon={<Compass size={13} />}
      title="Explore Roadmaps"
      lede="Discover learning paths shared by the community. Find inspiration and start learning from curated roadmaps."
      glyph={<Globe size={140} strokeWidth={1.2} />}
    />
  );
}
