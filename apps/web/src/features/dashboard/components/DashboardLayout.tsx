"use client";

import { type ReactNode } from "react";
import { Container } from "@mui/material";
import type { ContainerProps } from "@mui/material/Container";

interface DashboardLayoutProps {
  children: ReactNode;
  width?: ContainerProps["maxWidth"];
}

export function DashboardLayout({
  children,
  width = "xl",
}: DashboardLayoutProps) {
  return (
    <Container
      maxWidth={width}
      sx={{
        pt: { xs: 2, md: 4 },
        pb: { xs: 12, md: 10 },
      }}
    >
      {children}
    </Container>
  );
}
