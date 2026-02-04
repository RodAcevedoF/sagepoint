"use client";

import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { palette } from "@/common/theme";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  footer: {
    position: "relative",
    bgcolor: "background.default",
    pt: { xs: 8, md: 10 },
    pb: 4,
    mt: "auto",
    overflow: "hidden",
    borderTop: `1px solid ${alpha(palette.primary.light, 0.1)}`,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      height: "1px",
      background: `linear-gradient(90deg, transparent, ${alpha(palette.primary.light, 0.3)}, transparent)`,
    },
  },
  glow: {
    position: "absolute",
    bottom: "-150px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "300px",
    background: `radial-gradient(ellipse at center, ${alpha(palette.primary.main, 0.08)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
  },
  bottomBar: {
    mt: 1,
    pt: 4,
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    justifyContent: "space-between",
    alignItems: "center",
    gap: 2,
  },
  copyright: {
    color: "text.secondary",
    fontSize: "0.875rem",
  },
};

// ============================================================================
// Component
// ============================================================================

export function Footer() {
  return (
    <Box component="footer" sx={styles.footer}>
      {/* Decorative Glow */}
      <Box sx={styles.glow} />

      <Container maxWidth="lg" sx={styles.container}>
        <Grid
          container
          spacing={{ xs: 6, md: 4 }}
          justifyContent="space-between"
          sx={{ mb: 6 }}
        >
          {/* Column 1: Brand & Tech Stack */}
          <Grid size={{ xs: 12, md: 5 }}>
            <FooterBrand />
          </Grid>

          {/* Column 2 & 3: Product & Resources (handled by FooterLinks internally) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FooterLinks />
          </Grid>
        </Grid>

        <Divider
          sx={{ mt: 3, borderColor: alpha(palette.primary.light, 0.15) }}
        />

        <Box sx={styles.bottomBar}>
          <Typography variant="body2" sx={styles.copyright}>
            &copy; {new Date().getFullYear()} SagePoint. Built for the future of
            learning.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                cursor: "pointer",
                transition: "color 0.2s",
                "&:hover": { color: palette.primary.light },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                cursor: "pointer",
                transition: "color 0.2s",
                "&:hover": { color: palette.primary.light },
              }}
            >
              Terms of Service
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
