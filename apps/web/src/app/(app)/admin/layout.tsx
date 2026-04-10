"use client";

import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import {
  AdminSidebar,
  AdminMobileNav,
} from "@/features/admin/components/AdminSidebar";
import { Footer } from "@/shared/components/layout/Footer";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="lg" sx={{ py: 4, pb: { xs: 12, md: 4 }, flex: 1 }}>
        <AdminMobileNav />
        <Box sx={{ display: "flex", gap: 3 }}>
          <AdminSidebar />
          <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
