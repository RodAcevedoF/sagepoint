'use client';

import { Box, Typography, Stack, alpha } from '@mui/material';
import { motion } from 'framer-motion';
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
		height: 8,
		borderRadius: 4,
		bgcolor: alpha(palette.primary.light, 0.05),
	},
};

const PROGRESS_COLORS = [
	{ main: palette.primary.main, light: palette.primary.light },
	{ main: palette.warning.main, light: palette.warning.light },
	{ main: palette.info.main, light: palette.info.light },
	{ main: palette.success.main, light: palette.success.light },
	{ main: palette.error.main, light: palette.error.light },
];

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

			<Stack spacing={2.5}>
				{data.map((item, index) => {
					const color = PROGRESS_COLORS[index % PROGRESS_COLORS.length];
					return (
						<Box
							key={item.id}
							sx={styles.item}
							onClick={() => router.push(`/roadmaps/${item.id}`)}>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									mb: 1,
								}}>
								<Typography sx={styles.itemTitle}>{item.title}</Typography>
								<Typography
									sx={{
										...styles.itemMeta,
										color: color.light,
										fontWeight: 600,
									}}>
									{item.progressPercentage}%
								</Typography>
							</Box>
							<Box
								sx={{
									...styles.progressBar,
									position: 'relative',
									overflow: 'hidden',
								}}>
								<motion.div
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										bottom: 0,
										width: `${item.progressPercentage}%`,
										background: `linear-gradient(90deg, ${color.main}, ${color.light})`,
										borderRadius: 4,
										transformOrigin: 'left',
										boxShadow: `0 0 10px ${alpha(color.main, 0.4)}`,
									}}
								/>
							</Box>
							<Typography sx={{ ...styles.itemMeta, mt: 0.75 }}>
								{item.completedSteps}/{item.totalSteps} steps
							</Typography>
						</Box>
					);
				})}
			</Stack>
		</Card>
	);
}
