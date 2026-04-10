"use client";

import dynamic from "next/dynamic";
import { Loader } from "@/shared/components";

const AdminAnalytics = dynamic(
  () =>
    import("@/features/admin/components/AdminAnalytics").then(
      (m) => m.AdminAnalytics,
    ),
  { loading: () => <Loader /> },
);

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
