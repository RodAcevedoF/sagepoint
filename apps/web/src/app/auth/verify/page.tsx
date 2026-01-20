'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Container, Paper, Button } from '@mui/material';
import Link from 'next/link';

// API call (we can move to api file if we had one for verification, using fetch for simplicity or we can add to authApi)
const verifyToken = async (token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify?token=${token}`, {
    method: 'GET',
     headers: {
        'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.message || 'Verification failed');
  }
  return res.json();
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMsg('No token provided.');
      return;
    }

    verifyToken(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMsg(err.message);
      });
  }, [token, router]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {status === 'loading' && (
          <Box>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>Verifying your email...</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <Typography variant="h5" color="success.main" gutterBottom>
              Email Verified!
            </Typography>
            <Typography>
              Redirecting to login...
            </Typography>
            <Button component={Link} href="/login" sx={{ mt: 2 }} variant="contained">
              Go to Login
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <Typography variant="h5" color="error.main" gutterBottom>
              Verification Failed
            </Typography>
            <Typography color="text.secondary">
              {msg}
            </Typography>
             <Button component={Link} href="/login" sx={{ mt: 2 }} variant="outlined">
              Back to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<CircularProgress />}>
            <VerifyContent />
        </Suspense>
    )
}
