'use client';

import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { BookOpen, Lightbulb } from 'lucide-react';
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
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
					<Chip
						label={summary.topicArea}
						size='small'
						sx={{
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							color: theme.palette.primary.light,
							fontWeight: 600,
						}}
					/>
					<Chip
						label={summary.difficulty}
						size='small'
						sx={{
							bgcolor: alpha(theme.palette.warning.main, 0.1),
							color: theme.palette.warning.light,
							fontWeight: 500,
						}}
					/>
					{summary.estimatedReadTime && (
						<Chip
							label={`${summary.estimatedReadTime} min read`}
							size='small'
							variant='outlined'
							sx={{ color: alpha(theme.palette.text.secondary, 0.8) }}
						/>
					)}
				</Box>

				<Typography variant='body1' sx={{ mb: 3 }}>
					{summary.overview}
				</Typography>

				<Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1.5 }}>
					Key Points
				</Typography>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{summary.keyPoints.map((point, i) => (
						<Box
							key={i}
							sx={{
								display: 'flex',
								gap: 1.5,
								alignItems: 'flex-start',
								p: 1.5,
								borderRadius: 2.5,
								background: alpha(theme.palette.info.main, 0.04),
								border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
							}}>
							<Box sx={{
								mt: 0.25,
								color: theme.palette.info.light,
								flexShrink: 0,
							}}>
								<Lightbulb size={16} />
							</Box>
							<Typography variant='body2' sx={{ color: 'text.secondary' }}>
								{point}
							</Typography>
						</Box>
					))}
				</Box>
			</Card.Content>
		</Card>
	);
}
