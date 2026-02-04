"use client";

import { Container, Box, Toolbar } from "@mui/material";
import { PublicLayout, Antigravity } from "@/common/components";
import { palette } from "@/common/theme";
import { RegisterForm } from "./RegisterForm";

export function RegisterPage() {
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
          <RegisterForm />
        </Box>
      </Container>
    </PublicLayout>
  );
}
