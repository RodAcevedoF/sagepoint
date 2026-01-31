"use client";

import { Box, Container, Typography, Stack, alpha } from "@mui/material";
import { HeroActions } from "./HeroActions";
import { palette } from "@/common/theme";
import { Antigravity } from "@/common/components";
import { keyframes } from "@emotion/react";

const float = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    bgcolor: "background.default",
  },
  meshContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  blob1: {
    position: "absolute",
    top: "-10%",
    right: "10%",
    width: "60vw",
    height: "60vw",
    background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.12)} 0%, transparent 70%)`,
    filter: "blur(80px)",
    animation: `${float} 20s infinite ease-in-out`,
  },
  blob2: {
    position: "absolute",
    bottom: "10%",
    left: "-5%",
    width: "50vw",
    height: "50vw",
    background: `radial-gradient(circle, ${alpha(palette.secondary.main, 0.08)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    animation: `${float} 25s infinite ease-in-out reverse`,
  },
  container: {
    position: "relative",
    zIndex: 1,
    pt: { xs: 12, md: 15 },
    pb: { xs: 8, md: 12 },
    textAlign: "center",
  },
  badge: {
    mb: 4,
    bgcolor: alpha(palette.primary.main, 0.08),
    color: palette.primary.light,
    border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
    backdropFilter: "blur(4px)",
    px: 2,
    py: 0.8,
    borderRadius: "100px",
    display: "inline-flex",
    alignItems: "center",
    gap: 1.5,
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  title: {
    fontSize: { xs: "2.75rem", sm: "4rem", md: "5.5rem" },
    lineHeight: 1,
    letterSpacing: "-0.04em",
    fontWeight: 800,
    mb: 3,
    background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.6)} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  highlight: {
    background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
  },
  subtitle: {
    mb: 6,
    color: "text.secondary",
    maxWidth: 700,
    mx: "auto",
    fontSize: { xs: "1.1rem", md: "1.25rem" },
    lineHeight: 1.6,
    fontWeight: 400,
  },
};

export function HeroSection() {
  return (
    <Box sx={styles.root}>
      {/* Particle Animation Background */}
      <Antigravity
        count={450}
        magnetRadius={10}
        lerpSpeed={0.08}
        color={palette.primary.light}
        fieldStrength={15}
        particleSize={1.5}
      />

      {/* Decorative Mesh Background */}
      <Box sx={styles.meshContainer}>
        <Box sx={styles.blob1} />
        <Box sx={styles.blob2} />
      </Box>

      <Container maxWidth="lg" sx={styles.container}>
        <Stack alignItems="center">
          {/* Badge */}
          <Box sx={styles.badge}>
            <Box
              sx={{
                width: 6,
                height: 6,
                bgcolor: palette.primary.light,
                borderRadius: "50%",
                boxShadow: `0 0 12px ${palette.primary.light}`,
              }}
            />
            Beta v1.0 • Powered by GPT-4o & Neo4j
          </Box>

          <Typography variant="h1" sx={styles.title}>
            Master any subject <br />
            with{" "}
            <Box component="span" sx={styles.highlight}>
              AI Roadmaps
            </Box>
          </Typography>

          <Typography variant="body1" sx={styles.subtitle}>
            SagePoint transforms your documents into interactive knowledge
            graphs and personalized learning paths. Upload your PDFs, and let AI
            map your journey from beginner to expert.
          </Typography>

          <HeroActions />
        </Stack>
      </Container>
    </Box>
  );
}
