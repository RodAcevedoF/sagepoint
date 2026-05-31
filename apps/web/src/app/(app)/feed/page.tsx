"use client";

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { NewsFeed } from "@/features/feed/components/NewsFeed";

export default function FeedPage() {
  return (
    <DashboardLayout width="lg">
      <NewsFeed />
    </DashboardLayout>
  );
}
