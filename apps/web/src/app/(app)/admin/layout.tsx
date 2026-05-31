"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import {
  AdminSidebar,
  AdminMobileNav,
} from "@/features/admin/components/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout width="xl">
      <AdminMobileNav />
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        <AdminSidebar />
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </Box>
    </DashboardLayout>
  );
}
