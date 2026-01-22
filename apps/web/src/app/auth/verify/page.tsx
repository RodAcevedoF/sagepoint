'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Box,
	Typography,
	CircularProgress,
	Container,
	Paper,
	Button,
} from '@mui/material';
import Link from 'next/link';

// Verifies token with the backend and returns the JSON response or throws an Error
const verifyToken = async (token: string) => {
	const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/verify?token=${encodeURIComponent(
		token,
	)}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!res.ok) {
		const payload = await res.json().catch(() => null);
		throw new Error(
			payload?.message ?? res.statusText ?? 'Verification failed',
		);
	}

	return res.json();
};

export default function VerifyPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams?.get('token') ?? null;

	const [status, setStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>(token ? 'loading' : 'idle');
	const [msg, setMsg] = useState<string>(token ? '' : 'No token provided.');

	useEffect(() => {
		if (!token) return;

		let mounted = true;
		let redirectTimer: number | undefined;

		(async () => {
			try {
				setStatus('loading');
				await verifyToken(token);
				if (!mounted) return;
				setStatus('success');
				redirectTimer = window.setTimeout(() => router.push('/login'), 3000);
			} catch (err: unknown) {
				if (!mounted) return;
				setStatus('error');
				setMsg(err instanceof Error ? err.message : String(err));
			}
		})();

		return () => {
			mounted = false;
			if (redirectTimer) clearTimeout(redirectTimer);
		};
	}, [token, router]);

	return (
		<Suspense fallback={<CircularProgress />}>
			<Container maxWidth='sm' sx={{ mt: 8 }}>
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					{status === 'loading' && (
						<Box>
							<CircularProgress />
							<Typography variant='h6' sx={{ mt: 2 }}>
								Verifying your email...
							</Typography>
						</Box>
					)}

					{status === 'success' && (
						<Box>
							<Typography variant='h5' color='success.main' gutterBottom>
								Email Verified!
							</Typography>
							<Typography>Redirecting to login in 3s...</Typography>
							<Button
								component={Link}
								href='/login'
								sx={{ mt: 2 }}
								variant='contained'>
								Go to Login
							</Button>
						</Box>
					)}

					{status === 'error' && (
						<Box>
							<Typography variant='h5' color='error.main' gutterBottom>
								Verification Failed
							</Typography>
							<Typography color='text.secondary'>{msg}</Typography>
							<Button
								component={Link}
								href='/login'
								sx={{ mt: 2 }}
								variant='outlined'>
								Back to Login
							</Button>
						</Box>
					)}

					{status === 'idle' && (
						<Box>
							<Typography color='text.secondary'>{msg}</Typography>
							<Button
								component={Link}
								href='/login'
								sx={{ mt: 2 }}
								variant='outlined'>
								Back to Login
							</Button>
						</Box>
					)}
				</Paper>
			</Container>
		</Suspense>
	);
}
