"use client";

import { useState } from "react";
import { useLoginCommand } from "@/application/auth/commands/login.command";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Toolbar,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { PublicLayout, Antigravity } from "@/common/components";
import { palette } from "@/common/theme";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { execute, isLoading } = useLoginCommand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await execute(email, password);
    } catch (err: Error | unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Login failed");
    }
  };

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
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              width: "100%",
              borderRadius: 6,
              background: alpha(palette.background.paper, 0.4),
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={4}
            >
              <Typography
                component="h1"
                variant="h4"
                fontWeight="800"
                textAlign="center"
                sx={{
                  background: `linear-gradient(180deg, ${palette.text.primary} 30%, ${alpha(palette.text.primary, 0.7)} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Sign in to continue your learning journey
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 4,
                  mb: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
                  boxShadow: `0 4px 14px 0 ${alpha(palette.primary.main, 0.39)}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 100%)`,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box display="flex" justifyContent="center">
                <MuiLink
                  component={Link}
                  href="/register"
                  variant="body2"
                  underline="hover"
                  sx={{
                    color: palette.primary.light,
                    fontWeight: 600,
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </MuiLink>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </PublicLayout>
  );
}
