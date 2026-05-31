"use client";

import { RoomGrid } from "@/features/category";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { LearningCTA } from "@/shared/components";

export default function RoomsPage() {
  return (
    <>
      <DashboardLayout width="lg">
        <RoomGrid />
      </DashboardLayout>
      <LearningCTA {...LearningCTA.presets.roadmaps} />
    </>
  );
}
