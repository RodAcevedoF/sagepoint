'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/common/hooks';
import {
  AppBar,
  Box,
  Container,
  Link,
  Toolbar,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import {
  AutoStories as LearnIcon,
  AccountTree as GraphIcon,
  Lightbulb as InsightIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <LearnIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Smart Roadmaps',
    description: 'Upload documents and get AI-generated learning paths tailored to your goals.',
  },
  {
    icon: <GraphIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Knowledge Graphs',
    description: 'Visualize concept relationships with interactive force-directed graphs.',
  },
  {
    icon: <InsightIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Personalized Learning',
    description: 'Set your goals and interests to receive customized learning recommendations.',
  },
];

export function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            SagePoint
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button color="primary" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button variant="contained" onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed navbar */}
      <Toolbar />

      {/* Hero */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            Learn smarter, not harder
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ mb: 4, opacity: 0.9, maxWidth: 600, fontSize: { xs: '1.1rem', md: '1.5rem' } }}
          >
            Transform your documents into personalized learning roadmaps powered by AI and knowledge graphs.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h4" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
          How it works
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Upload your learning materials, and SagePoint extracts concepts, maps their relationships, and builds a roadmap just for you.
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="center"
        >
          {features.map((feature) => (
            <Paper
              key={feature.title}
              elevation={0}
              sx={{
                p: 4,
                flex: 1,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          pt: { xs: 4, md: 6 },
          pb: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 4 }}
            justifyContent="space-between"
          >
            {/* Brand */}
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                SagePoint
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                AI-powered learning roadmaps from your own documents.
              </Typography>
            </Box>

            {/* Links */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <Stack spacing={0.5}>
                <Link
                  component="button"
                  variant="body2"
                  underline="hover"
                  color="text.secondary"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Link>
                <Link
                  component="button"
                  variant="body2"
                  underline="hover"
                  color="text.secondary"
                  onClick={() => router.push('/register')}
                >
                  Create Account
                </Link>
              </Stack>
            </Box>

            {/* About */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 240 }}>
                Built as a University Thesis Project (TFG) showcasing Clean Architecture, DDD, and AI-driven learning.
              </Typography>
            </Box>
          </Stack>

          {/* Copyright */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 4 }}
          >
            &copy; {new Date().getFullYear()} SagePoint. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
