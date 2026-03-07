'use client';

import { Box, Container } from '@mui/material';
import { ExploreRoadmaps } from '@/features/roadmap/components/ExploreRoadmaps';

export default function ExplorePage() {
	return (
		<Box sx={{ minHeight: '100vh', pt: 2, pb: 12 }}>
			<Container maxWidth='lg'>
				<ExploreRoadmaps />
			</Container>
		</Box>
	);
}
