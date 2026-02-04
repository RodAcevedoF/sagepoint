"use client";

import { type ReactNode } from "react";
import { Box, Container, Toolbar } from "@mui/material";
import { palette } from "@/common/theme";
import { Navbar, NavbarActions } from "@/common/components/Navbar";
import { Footer } from "@/common/components/Footer";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "background.default",
    background: palette.background.gradient,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 1,
    padding: { xs: "8px 16px", md: 0 },
  },
  content: {
    pt: { xs: 4, md: 6 },
    pb: { xs: 8, md: 12 },
  },
};

// ============================================================================
// Component
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout provides the authenticated shell for the application.
 * It uses the unified Navbar and Footer components for consistency across the app,
 * injecting dashboard-specific actions into the Navbar.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Box sx={styles.root}>
      {/* Unified Navbar with Dashboard-specific actions */}
      <Navbar
        actions={<NavbarActions mode="dashboard" />}
        showPublicLinks={false}
      />

      {/* Main Content Area */}
      <Box component="main" sx={styles.main}>
        {/*
          Toolbar spacer to push content below the fixed Navbar.
          Landing page omits this for hero overlap, but dashboard needs the space.
        */}
        <Toolbar sx={{ height: { xs: 64, md: 80 } }} />

        <Container maxWidth="xl" sx={styles.content}>
          {children}
        </Container>
      </Box>

      {/* Unified Footer */}
      <Footer />
    </Box>
  );
}
