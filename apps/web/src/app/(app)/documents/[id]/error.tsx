'use client';

import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { ErrorState } from '@/common/components';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function DocumentDetailError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Document detail error:', error);
	}, [error]);

	return (
		<Box sx={{ minHeight: '100vh', pt: 2, pb: 12 }}>
			<Container maxWidth='lg'>
				<ErrorState
					title='Failed to load document'
					description='Something went wrong while loading this document. Please try again or go back to your documents.'
					onRetry={reset}
					retryLabel='Try again'
				/>
			</Container>
		</Box>
	);
}
