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
import { palette } from "@/shared/theme";

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
    mt: 4,
    pt: 4,
    pb: 2,
    display: "flex",
    flexDirection: { xs: "column-reverse", md: "row" },
    justifyContent: "space-between",
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  copyright: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontFamily: "monospace",
    "& span": {
      color: "primary.main",
      fontWeight: 700,
    },
  },
  bottomLink: {
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -4,
      left: "50%",
      width: "0%",
      height: "1px",
      bgcolor: "primary.light",
      transition: "inherit",
      transform: "translateX(-50%)",
    },
    "&:hover": {
      color: "#fff",
      "&::after": {
        width: "100%",
      },
    },
  },
};

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
          <Grid size={{ xs: 12, md: 5 }}>
            <FooterBrand />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FooterLinks />
          </Grid>
        </Grid>

        <Divider
          sx={{ mt: 3, borderColor: alpha(palette.primary.light, 0.15) }}
        />

        <Box sx={styles.bottomBar}>
          <Typography variant="body2" sx={styles.copyright}>
            &copy; {new Date().getFullYear()} <span>SAGEPOINT</span> &middot;
            FUTURE OF LEARNING
          </Typography>

          <Stack
            direction="row"
            spacing={4}
            alignItems="center"
            sx={{
              position: "relative",
              "& > *:not(:last-child)::after": {
                content: '"/"',
                position: "absolute",
                right: -18,
                color: "rgba(255,255,255,0.1)",
                fontWeight: 300,
              },
            }}
          >
            <Typography variant="caption" sx={styles.bottomLink}>
              Privacy
            </Typography>
            <Typography variant="caption" sx={styles.bottomLink}>
              Terms
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
