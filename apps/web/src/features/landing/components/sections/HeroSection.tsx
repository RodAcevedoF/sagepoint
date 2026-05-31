"use client";

import { Box, Container, Stack } from "@mui/material";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { HeroActions } from "./HeroActions";

const styles = {
  root: {
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    pt: { xs: 12, md: 18 },
    pb: { xs: 10, md: 16 },
  },
  container: {
    position: "relative",
    zIndex: 1,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 17px",
    borderRadius: auroraPalette.radii.pill,
    whiteSpace: "nowrap",
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: auroraPalette.tx,
    background: auroraTint(auroraPalette.teal, 0.08),
    border: `1px solid ${auroraTint(auroraPalette.teal, 0.28)}`,
    backdropFilter: "blur(4px)",
    marginTop: 5,
    "@media (max-width: 640px)": {
      fontSize: "10.5px",
      padding: "7px 14px",
      whiteSpace: "normal",
      letterSpacing: "0.08em",
    },
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: auroraPalette.status.ready,
    boxShadow: `0 0 0 3px ${auroraTint(auroraPalette.status.ready, 0.25)}`,
    animation: "sp-hero-pulse 1.6s ease-in-out infinite",
    "@keyframes sp-hero-pulse": {
      "50%": { opacity: 0.4 },
    },
  },
  title: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: "clamp(48px, 7vw, 92px)",
    lineHeight: 0.98,
    letterSpacing: "-0.035em",
    margin: "28px 0 0",
    color: auroraPalette.txHi,
  },
  highlight: {
    background: `linear-gradient(115deg, ${auroraPalette.teal} 10%, oklch(0.86 0.10 170) 60%, ${auroraPalette.status.concept} 110%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
  },
  lede: {
    margin: "28px auto 0",
    maxWidth: "62ch",
    fontSize: { xs: "16px", md: "18.5px" },
    lineHeight: 1.65,
    color: auroraPalette.txMid,
    textWrap: "pretty",
  },
  actions: {
    mt: 5,
  },
  stats: {
    mt: { xs: 7, md: 8 },
    display: "flex",
    gap: { xs: "32px", md: "50px" },
    justifyContent: "center",
    flexWrap: "wrap",
  },
  statValue: {
    fontFamily: auroraPalette.font.display,
    fontWeight: 800,
    fontSize: "34px",
    color: auroraPalette.txHi,
    letterSpacing: "-0.02em",
    "& b": {
      color: auroraPalette.teal,
      fontWeight: "inherit",
    },
  },
  statLabel: {
    mt: 0.5,
    fontFamily: auroraPalette.font.mono,
    fontSize: "13px",
    color: auroraPalette.txLow,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
  },
} as const;

const STATS = [
  { value: "12k+", label: "Docs analyzed" },
  { value: "3.4k", label: "Roadmaps built" },
  { value: "98%", label: "Concept recall" },
];

export function HeroSection() {
  return (
    <Box component="header" sx={styles.root}>
      <Container maxWidth="md" sx={styles.container}>
        <Stack alignItems="center">
          <Box sx={styles.badge}>
            <Box sx={styles.pulse} />
            Beta {process.env.NEXT_PUBLIC_APP_VERSION} · Powered by AI
            multi-agent system
          </Box>

          <Box component="h1" sx={styles.title}>
            Master any subject
            <br />
            with{" "}
            <Box component="span" sx={styles.highlight}>
              AI Roadmaps
            </Box>
          </Box>

          <Box component="p" sx={styles.lede}>
            SagePoint transforms your documents into interactive knowledge
            graphs and personalized learning paths. Upload your PDFs, and let AI
            map your journey from beginner to expert.
          </Box>

          <Box sx={styles.actions}>
            <HeroActions />
          </Box>

          <Box sx={styles.stats}>
            {STATS.map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center" }}>
                <Box sx={styles.statValue}>
                  <b>{stat.value}</b>
                </Box>
                <Box sx={styles.statLabel}>{stat.label}</Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
