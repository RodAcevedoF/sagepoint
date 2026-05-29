"use client";

import { Container, Box, Toolbar } from "@mui/material";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { RegisteredToast } from "./RegisteredToast";

export function LoginPage() {
  return (
    <>
      <Suspense>
        <RegisteredToast />
      </Suspense>
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
    </>
  );
}
