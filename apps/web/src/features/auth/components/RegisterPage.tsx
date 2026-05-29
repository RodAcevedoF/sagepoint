"use client";

import { Container, Box, Toolbar } from "@mui/material";
import { RegisterForm } from "./RegisterForm";

interface RegisterPageProps {
  invitationToken?: string;
  invitedEmail?: string;
}

export function RegisterPage({
  invitationToken,
  invitedEmail,
}: RegisterPageProps) {
  return (
    <>
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
    </>
  );
}
