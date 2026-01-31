"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";
import { PublicThemeProvider } from "./PublicThemeProvider";
import { Navbar, NavbarActions } from "@/common/components/Navbar";
import { Footer } from "@/common/components/Footer";

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    bgcolor: "background.default",
    position: "relative",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};

interface PublicLayoutProps {
  children: ReactNode;
  navbarActions?: ReactNode;
}

export function PublicLayout({
  children,
  navbarActions = <NavbarActions />,
}: PublicLayoutProps) {
  return (
    <PublicThemeProvider>
      <Box sx={styles.root}>
        <Navbar actions={navbarActions} />
        {/*
          Toolbar spacer removed to allow content (like HeroSection)
          to flow directly under the transparent Navbar.
        */}
        <Box component="main" sx={styles.main}>
          {children}
        </Box>
        <Footer />
      </Box>
    </PublicThemeProvider>
  );
}
