"use client";

import { Box, Container } from "@mui/material";
import { aurora, auroraTint } from "@/shared/theme";
import { SmartHomeButton, GoBackButton } from "@/shared/components";

const containerSx = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative" as const,
  overflow: "hidden",
  fontFamily: aurora.font.ui,
  color: aurora.tx,
  background: `radial-gradient(1100px 620px at 18% -8%, oklch(0.40 0.10 200 / 0.30), transparent 60%), radial-gradient(900px 600px at 92% 4%, oklch(0.34 0.10 268 / 0.34), transparent 58%), linear-gradient(180deg, ${aurora.bg1}, ${aurora.bg0} 60%)`,
} as const;

const contentSx = {
  textAlign: "center",
  maxWidth: 520,
} as const;

const errorCodeSx = {
  fontFamily: aurora.font.display,
  fontSize: { xs: "8rem", md: "12rem" },
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.04em",
  background: `linear-gradient(135deg, ${aurora.txHi} 18%, ${aurora.teal} 92%)`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "8px",
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  color: aurora.txHi,
  fontWeight: 800,
  fontSize: { xs: "26px", md: "32px" },
  letterSpacing: "-0.02em",
  margin: 0,
  mb: "12px",
} as const;

const messageSx = {
  color: aurora.txMid,
  fontSize: "15.5px",
  lineHeight: 1.55,
  margin: 0,
  mb: "28px",
  textWrap: "pretty" as const,
} as const;

const actionsSx = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  flexWrap: "wrap" as const,
} as const;

const orbSx = {
  position: "absolute" as const,
  borderRadius: "50%",
  filter: "blur(80px)",
  opacity: 0.35,
  pointerEvents: "none" as const,
} as const;

export default function NotFound() {
  return (
    <Box sx={containerSx}>
      <Box
        sx={{
          ...orbSx,
          width: 400,
          height: 400,
          background: auroraTint(aurora.teal, 0.6),
          top: "10%",
          left: "10%",
        }}
      />
      <Box
        sx={{
          ...orbSx,
          width: 300,
          height: 300,
          background: auroraTint(aurora.status.concept, 0.6),
          bottom: "10%",
          right: "15%",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={contentSx}>
          <Box component="h1" sx={errorCodeSx}>
            404
          </Box>

          <Box component="h2" sx={titleSx}>
            Page not found
          </Box>

          <Box component="p" sx={messageSx}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </Box>

          <Box sx={actionsSx}>
            <SmartHomeButton />
            <GoBackButton />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
