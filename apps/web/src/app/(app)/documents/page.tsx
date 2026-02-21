'use client';

import { Box, Container } from '@mui/material';
import { DocumentList } from '@/features/document';
import { LearningCTA } from '@/common/components';

export default function DocumentsPage() {
	return (
		<Box sx={{ minHeight: '100vh', pt: 2, pb: 12 }}>
			<Container maxWidth='lg'>
				<DocumentList />
			</Container>
			<LearningCTA />
		</Box>
	);
}
