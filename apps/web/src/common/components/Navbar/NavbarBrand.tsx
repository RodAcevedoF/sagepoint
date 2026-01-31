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

const styles = {
  link: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  },
  brand: {
    fontSize: { xs: "1.25rem", md: "1.5rem" },
    fontWeight: 800,
    letterSpacing: "-0.04em",
    ml: 1.5,
    background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.6)} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 0.8,
    },
  },
} satisfies Record<string, SxProps<Theme>>;

export function NavbarBrand() {
  return (
    <Box component={Link} href="/" sx={styles.link}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CardMedia
          component="img"
          src={mainLogo.src}
          alt="SagePoint Logo"
          sx={{
            width: { xs: 32, md: 40 },
            height: { xs: 32, md: 40 },
            filter: `drop-shadow(0 0 12px ${alpha(palette.primary.main, 0.3)})`,
          }}
        />
      </Box>
      <Typography variant="h6" sx={styles.brand}>
        SagePoint
      </Typography>
    </Box>
  );
}
