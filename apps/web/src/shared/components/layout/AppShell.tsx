"use client";

import type { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import { DashboardAppBar } from "@/shared/components";
import { Navbar, NavbarActions } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { palette } from "@/shared/theme";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        background: palette.background.gradient,
      }}
    >
      <Navbar
        actions={<NavbarActions mode="dashboard" />}
        showPublicLinks={false}
      />
      <Toolbar sx={{ height: { xs: 64, md: 80 }, flexShrink: 0 }} />
      <Box
        component="main"
        sx={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </Box>
      <Footer />
      <DashboardAppBar />
    </Box>
  );
}
