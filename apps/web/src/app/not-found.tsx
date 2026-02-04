"use client";

import { Box, Container, Typography } from "@mui/material";
import { palette } from "@/common/theme";
import { SmartHomeButton, GoBackButton } from "@/common/components";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: palette.background.gradient,
    position: "relative",
    overflow: "hidden",
  },
  content: {
    textAlign: "center",
    maxWidth: 500,
  },
  errorCode: {
    fontSize: { xs: "8rem", md: "12rem" },
    fontWeight: 800,
    lineHeight: 1,
    background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    mb: 2,
  },
  title: {
    color: "text.primary",
    fontWeight: 700,
    mb: 2,
  },
  message: {
    color: "text.secondary",
    mb: 4,
  },
  actions: {
    display: "flex",
    gap: 2,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  decorativeOrb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.3,
    pointerEvents: "none",
  },
};

// ============================================================================
// Component
// ============================================================================

export default function NotFound() {
  return (
    <Box sx={styles.container}>
      {/* Decorative background orbs */}
      <Box
        sx={{
          ...styles.decorativeOrb,
          width: 400,
          height: 400,
          bgcolor: palette.primary.main,
          top: "10%",
          left: "10%",
        }}
      />
      <Box
        sx={{
          ...styles.decorativeOrb,
          width: 300,
          height: 300,
          bgcolor: palette.secondary.main,
          bottom: "10%",
          right: "15%",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={styles.content}>
          <Typography component="h1" sx={styles.errorCode}>
            404
          </Typography>

          <Typography variant="h4" sx={styles.title}>
            Page not found
          </Typography>

          <Typography variant="body1" sx={styles.message}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </Typography>

          <Box sx={styles.actions}>
            <SmartHomeButton />
            <GoBackButton />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
