'use client';

import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { BookOpen } from 'lucide-react';
import { Card } from '@/common/components';
import type { DocumentSummaryDto } from '@/infrastructure/api/documentApi';

interface DocumentSummaryViewProps {
	summary: DocumentSummaryDto;
}

export function DocumentSummaryView({ summary }: DocumentSummaryViewProps) {
	const theme = useTheme();

	return (
		<Card variant='glass'>
			<Card.Header>
				<Card.IconBox>
					<BookOpen size={20} />
				</Card.IconBox>
				<Typography variant='h6' sx={{ fontWeight: 600 }}>
					Summary
				</Typography>
			</Card.Header>
			<Card.Content>
				<Typography variant='body1' sx={{ mb: 2 }}>
					{summary.overview}
				</Typography>

				<Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
					Key Points
				</Typography>
				<Box component='ul' sx={{ pl: 2, mb: 2 }}>
					{summary.keyPoints.map((point, i) => (
						<Typography key={i} component='li' variant='body2' color='text.secondary'>
							{point}
						</Typography>
					))}
				</Box>

				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
					<Chip label={summary.topicArea} size='small' color='primary' variant='outlined' />
					<Chip label={summary.difficulty} size='small' variant='outlined' />
					{summary.estimatedReadTime && (
						<Chip
							label={`${summary.estimatedReadTime} min read`}
							size='small'
							variant='outlined'
							sx={{ color: alpha(theme.palette.text.secondary, 0.8) }}
						/>
					)}
				</Box>
			</Card.Content>
		</Card>
	);
}
