"use client";

import dynamic from "next/dynamic";
import { Loader } from "@/shared/components";

const AdminUsersTable = dynamic(
  () =>
    import("@/features/admin/components/AdminUsers/AdminUsersTable").then(
      (m) => m.AdminUsersTable,
    ),
  { loading: () => <Loader /> },
);

export default function AdminUsersPage() {
  return <AdminUsersTable />;
}
