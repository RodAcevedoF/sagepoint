'use client';

import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { ErrorState } from '@/common/components';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('App error:', error);
	}, [error]);

	return (
		<Box sx={{ minHeight: '100vh', py: 4, pb: 12 }}>
			<Container maxWidth='lg'>
				<ErrorState
					title='Something went wrong'
					description='An unexpected error occurred. Please try again.'
					onRetry={reset}
				/>
			</Container>
		</Box>
	);
}
