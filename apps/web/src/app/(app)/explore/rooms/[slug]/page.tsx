"use client";

import { use } from "react";
import { RoomDetail } from "@/features/category";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <DashboardLayout width="lg">
      <RoomDetail slug={slug} />
    </DashboardLayout>
  );
}
