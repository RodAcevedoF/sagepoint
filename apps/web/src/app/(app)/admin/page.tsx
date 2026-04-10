"use client";

import dynamic from "next/dynamic";
import { Loader } from "@/shared/components";

const AdminDashboard = dynamic(
  () =>
    import("@/features/admin/components/AdminDashboard").then(
      (m) => m.AdminDashboard,
    ),
  { loading: () => <Loader /> },
);

export default function AdminPage() {
  return <AdminDashboard />;
}
