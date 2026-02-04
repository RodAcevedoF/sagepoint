"use client";

import {
  Typography,
  Box,
  SxProps,
  Theme,
  CardMedia,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { palette } from "@/common/theme";
import { mainLogo } from "root/public";

interface BrandProps {
  showLogo?: boolean;
  fontSize?: string | object;
  withLink?: boolean;
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "inherit",
  },
  logo: {
    filter: `drop-shadow(0 0 12px ${alpha(palette.primary.main, 0.3)})`,
    transition: "transform 0.3s ease",
  },
  text: {
    fontWeight: 800,
    letterSpacing: "-0.04em",
    display: "flex",
    alignItems: "center",
    transition: "opacity 0.2s ease",
  },
  sage: {
    background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  point: {
    background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.6)} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
} satisfies Record<string, SxProps<Theme>>;

/**
 * Unified Brand component used in Navbar and Footer.
 * Supports toggling the logo and specific coloring for "Sage" and "Point".
 */
export function Brand({
  showLogo = true,
  fontSize = { xs: "1.25rem", md: "1.5rem" },
  withLink = true,
}: BrandProps) {
  const content = (
    <>
      {showLogo && (
        <Box sx={{ display: "flex", alignItems: "center", mr: 1.5 }}>
          <CardMedia<"img">
            component="img"
            image={mainLogo.src}
            alt="SagePoint Logo"
            sx={{
              ...styles.logo,
              width: { xs: 32, md: 40 },
              height: "auto",
            }}
          />
        </Box>
      )}
      <Typography variant="h6" sx={{ ...styles.text, fontSize }}>
        <Box component="span" sx={styles.sage}>
          Sage
        </Box>
        <Box component="span" sx={styles.point}>
          Point
        </Box>
      </Typography>
    </>
  );

  if (withLink) {
    return (
      <Box
        component={Link}
        href="/"
        sx={{
          ...styles.container,
          "&:hover": {
            opacity: 0.9,
            "& img": { transform: "scale(1.05)" },
          },
        }}
      >
        {content}
      </Box>
    );
  }

  return <Box sx={styles.container}>{content}</Box>;
}
