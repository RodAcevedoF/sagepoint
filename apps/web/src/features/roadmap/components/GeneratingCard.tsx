'use client';

import { Box, Typography, CircularProgress, Chip, useTheme } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { makeStyles } from './GeneratingCard.styles';

import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';

interface GeneratingCardProps {
	data: UserRoadmapDto;
}

export function GeneratingCard({ data }: GeneratingCardProps) {
	const theme = useTheme();
	const { roadmap } = data;
	const isFailed = roadmap.generationStatus === 'failed';
	const styles = makeStyles(isFailed, theme);

	return (
		<Box sx={styles.container}>
			{isFailed ? (
				<AlertCircle size={28} color={theme.palette.error.main} />
			) : (
				<CircularProgress size={28} thickness={3} />
			)}
			<Typography variant='subtitle2' sx={styles.title}>
				{roadmap.title}
			</Typography>
			<Chip
				size='small'
				label={isFailed ? 'Failed' : 'Generating...'}
				sx={styles.chip}
			/>
			{isFailed && roadmap.errorMessage && (
				<Typography variant='caption' color='text.secondary'>
					{roadmap.errorMessage}
				</Typography>
			)}
		</Box>
	);
}
