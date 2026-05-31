"use client";

import { AppBar, Toolbar, Container, Box } from "@mui/material";
import { ReactNode } from "react";
import { NavbarBrand } from "./NavbarBrand";
import { aurora, auroraTint } from "@/shared/theme";

const styles = {
  appBar: {
    bgcolor: "transparent",
    background: `linear-gradient(180deg, ${auroraTint(aurora.surface2, 0.72)}, ${auroraTint(aurora.bg1, 0.5)})`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid oklch(1 0 0 / 0.035)`,
    backgroundImage: "none",
    boxShadow: "none",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "-1px",
      height: "1px",
      background: `linear-gradient(90deg, transparent, ${auroraTint(aurora.teal, 0.5)} 30%, ${auroraTint(aurora.status.concept, 0.45)} 70%, transparent)`,
      pointerEvents: "none",
    },
  },
  toolbar: {
    justifyContent: "space-between",
    height: { xs: 64, md: 80 },
  },
};

interface NavbarProps {
  actions?: ReactNode;
  showPublicLinks?: boolean;
}

export function Navbar({ actions }: NavbarProps) {
  return (
    <AppBar position="fixed" elevation={0} sx={styles.appBar}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={styles.toolbar}>
          <NavbarBrand />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.5 },
            }}
          >
            {actions}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
