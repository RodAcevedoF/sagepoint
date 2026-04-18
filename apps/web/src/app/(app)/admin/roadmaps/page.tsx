"use client";

import dynamic from "next/dynamic";
import { Loader } from "@/shared/components";

const AdminRoadmapsTable = dynamic(
  () =>
    import("@/features/admin/components/AdminRoadmaps/AdminRoadmapsTable").then(
      (m) => m.AdminRoadmapsTable,
    ),
  { loading: () => <Loader /> },
);

export default function AdminRoadmapsPage() {
  return <AdminRoadmapsTable />;
}
