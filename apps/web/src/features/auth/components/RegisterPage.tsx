"use client";

import dynamic from "next/dynamic";
import { Container, Box, Toolbar } from "@mui/material";
import { PublicLayout } from "@/shared/components";
import { palette } from "@/shared/theme";
import { RegisterForm } from "./RegisterForm";

const Antigravity = dynamic(
  () =>
    import("@/shared/components/ui/animations/Antigravity").then(
      (m) => m.Antigravity,
    ),
  { ssr: false },
);

interface RegisterPageProps {
  invitationToken?: string;
  invitedEmail?: string;
}

export function RegisterPage({
  invitationToken,
  invitedEmail,
}: RegisterPageProps) {
  return (
    <PublicLayout>
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
          <RegisterForm
            invitationToken={invitationToken}
            invitedEmail={invitedEmail}
          />
        </Box>
      </Container>
    </PublicLayout>
  );
}
