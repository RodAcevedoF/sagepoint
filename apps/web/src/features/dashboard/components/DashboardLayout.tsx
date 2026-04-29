"use client";

import { type ReactNode } from "react";
import { Container } from "@mui/material";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Container
      maxWidth="xl"
      sx={{
        pt: { xs: 2, md: 4 },
        pb: { xs: 12, md: 10 },
      }}
    >
      {children}
    </Container>
  );
}
