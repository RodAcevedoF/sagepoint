"use client";

import dynamic from "next/dynamic";
import { Container, Box, Toolbar } from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { RegisteredToast } from "./RegisteredToast";

const Antigravity = dynamic(
  () =>
    import("@/shared/components/ui/animations/Antigravity").then(
      (m) => m.Antigravity,
    ),
  { ssr: false },
);

export function LoginPage() {
  return (
    <PublicLayout>
      <Suspense>
        <RegisteredToast />
      </Suspense>
      <Antigravity
        count={350}
        magnetRadius={10}
        lerpSpeed={0.08}
        color={palette.primary.light}
        fieldStrength={10}
        particleSize={1.5}
      />
      <Toolbar sx={{ mb: 2 }} />
      <Container
        component="main"
        maxWidth="xs"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box
          sx={{
            py: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LoginForm />
        </Box>
      </Container>
    </PublicLayout>
  );
}
