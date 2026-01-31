"use client";

import {
  AppBar,
  Toolbar,
  Container,
  alpha,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { NavbarBrand } from "./NavbarBrand";
import { palette } from "@/common/theme";
import {
  GitHub as GitHubIcon,
  MenuBook as LearnIcon,
  AutoAwesome as SparklesIcon,
} from "@mui/icons-material";

const styles = {
  appBar: (isScrolled: boolean) => ({
    bgcolor: isScrolled
      ? alpha(palette.background.default, 0.7)
      : "transparent",
    backdropFilter: isScrolled ? "blur(20px)" : "none",
    borderBottom: "1px solid",
    borderColor: isScrolled ? alpha(palette.primary.light, 0.1) : "transparent",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundImage: "none",
    boxShadow: isScrolled ? `0 4px 30px ${alpha("#000", 0.2)}` : "none",
  }),
  toolbar: {
    justifyContent: "space-between",
    height: { xs: 64, md: 80 },
    transition: "height 0.4s ease",
  },
  iconButton: {
    color: alpha(palette.text.primary, 0.7),
    transition: "all 0.2s",
    "&:hover": {
      color: palette.primary.light,
      bgcolor: alpha(palette.primary.main, 0.1),
    },
  },
} satisfies Record<string, unknown>;

interface NavbarProps {
  actions?: ReactNode;
}

export function Navbar({ actions }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar position="fixed" elevation={0} sx={styles.appBar(isScrolled)}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={styles.toolbar}>
          <NavbarBrand />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1,
                mr: 2,
              }}
            >
              <Tooltip title="View Roadmaps">
                <IconButton sx={styles.iconButton}>
                  <LearnIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="GitHub Repository">
                <IconButton sx={styles.iconButton}>
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="AI Features">
                <IconButton sx={styles.iconButton}>
                  <SparklesIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {actions}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
