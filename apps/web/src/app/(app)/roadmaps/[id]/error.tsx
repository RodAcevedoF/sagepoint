'use client';

import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { ErrorState } from '@/common/components';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function RoadmapDetailError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Roadmap detail error:', error);
	}, [error]);

	return (
		<Box sx={{ minHeight: '100vh', py: 4, pb: 12 }}>
			<Container maxWidth='lg'>
				<ErrorState
					title='Failed to load roadmap'
					description='Something went wrong while loading this roadmap. Please try again or go back to your roadmaps.'
					onRetry={reset}
					retryLabel='Try again'
				/>
			</Container>
		</Box>
	);
}
