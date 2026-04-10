"use client";

import dynamic from "next/dynamic";
import { Loader } from "@/shared/components";

const AdminInvitationsTable = dynamic(
  () =>
    import("@/features/admin/components/AdminInvitationsTable").then(
      (m) => m.AdminInvitationsTable,
    ),
  { loading: () => <Loader /> },
);

export default function AdminInvitationsPage() {
  return <AdminInvitationsTable />;
}
