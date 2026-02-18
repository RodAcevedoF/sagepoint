'use client';

import { Box, Typography, LinearProgress, Stack, alpha } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import type { RoadmapProgressItem } from '../types/dashboard.types';

// ============================================================================
// Styles
// ============================================================================

const styles = {
	card: {
		p: 3,
		height: '100%',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 3,
	},
	title: {
		fontWeight: 600,
	},
	subtitle: {
		color: palette.text.secondary,
		fontSize: '0.875rem',
	},
	item: {
		cursor: 'pointer',
		p: 1.5,
		borderRadius: 2,
		transition: 'all 0.2s ease',
		'&:hover': {
			bgcolor: alpha(palette.primary.light, 0.05),
		},
	},
	itemTitle: {
		fontWeight: 500,
		fontSize: '0.875rem',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	itemMeta: {
		color: palette.text.secondary,
		fontSize: '0.75rem',
	},
	progressBar: {
		height: 6,
		borderRadius: 3,
		bgcolor: alpha(palette.primary.light, 0.1),
		'& .MuiLinearProgress-bar': {
			borderRadius: 3,
			background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.light})`,
		},
	},
};

// ============================================================================
// Component
// ============================================================================

interface DashboardProgressProps {
	data: RoadmapProgressItem[];
}

export function DashboardProgress({ data }: DashboardProgressProps) {
	const router = useRouter();

	return (
		<Card variant='glass' hoverable={false} sx={styles.card}>
			<Box sx={styles.header}>
				<Box>
					<Typography variant='h6' sx={styles.title}>
						Roadmap Progress
					</Typography>
					<Typography sx={styles.subtitle}>
						{data.length} roadmap{data.length !== 1 ? 's' : ''}
					</Typography>
				</Box>
			</Box>

			<Stack spacing={1.5}>
				{data.map((item) => (
					<Box
						key={item.id}
						sx={styles.item}
						onClick={() => router.push(`/roadmaps/${item.id}`)}>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								mb: 0.5,
							}}>
							<Typography sx={styles.itemTitle}>{item.title}</Typography>
							<Typography sx={styles.itemMeta}>
								{item.progressPercentage}%
							</Typography>
						</Box>
						<LinearProgress
							variant='determinate'
							value={item.progressPercentage}
							sx={styles.progressBar}
						/>
						<Typography sx={{ ...styles.itemMeta, mt: 0.5 }}>
							{item.completedSteps}/{item.totalSteps} steps
						</Typography>
					</Box>
				))}
			</Stack>
		</Card>
	);
}
