"use client";

import { Box } from "@mui/material";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { aurora as auroraPalette } from "@/shared/theme";

const styles = {
  root: {
    position: "relative",
    mt: "auto",
    pt: { xs: 8, md: 9 },
    pb: 4.5,
    borderTop: `1px solid ${auroraPalette.line}`,
    background: `linear-gradient(180deg, transparent, oklch(0.16 0.026 262 / 0.5))`,
  },
  container: {
    maxWidth: "1180px",
    mx: "auto",
    px: { xs: 2.5, md: 5 },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr 1fr" },
    gap: { xs: "36px", md: "40px" },
  },
  rule: {
    height: "1px",
    background: auroraPalette.line,
    mt: { xs: 5, md: 6 },
    mb: 3,
  },
  bottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
  },
  copy: {
    fontFamily: auroraPalette.font.mono,
    fontSize: "12px",
    letterSpacing: "0.06em",
    color: auroraPalette.txLow,
    whiteSpace: "nowrap",
    "& b": {
      color: auroraPalette.teal,
      fontWeight: 600,
    },
  },
  legal: {
    display: "flex",
    gap: "26px",
  },
  legalLink: {
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: auroraPalette.txLow,
    cursor: "pointer",
    transition: "color .15s ease",
    "&:hover": { color: auroraPalette.txHi },
  },
} as const;

export function Footer() {
  return (
    <Box component="footer" sx={styles.root}>
      <Box sx={styles.container}>
        <Box sx={styles.grid}>
          <FooterBrand />
          <FooterLinks />
        </Box>

        <Box sx={styles.rule} />

        <Box sx={styles.bottom}>
          <Box component="span" sx={styles.copy}>
            © {new Date().getFullYear()} <b>SAGEPOINT</b> · FUTURE OF LEARNING
          </Box>
          <Box sx={styles.legal}>
            <Box component="a" sx={styles.legalLink}>
              Privacy
            </Box>
            <Box component="a" sx={styles.legalLink}>
              Terms
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
