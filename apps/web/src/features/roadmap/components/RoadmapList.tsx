'use client';

import { Box, Grid, Typography, useTheme, alpha, CircularProgress, Chip } from '@mui/material';
import { BookOpen, Lightbulb, Rocket, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserRoadmapsQuery } from '@/application/roadmap';
import { ErrorState, Loader, Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';
import { RoadmapCard } from './RoadmapCard';
import { RoadmapHero } from './RoadmapHero';
import { RoadmapStats } from './RoadmapStats';
import { makeStyles } from './RoadmapList.styles';

import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';

const MotionGrid = motion.create(Grid);

const staggerContainer = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.4 },
	},
};

const staggerItem = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function EmptyRoadmapState() {
	const theme = useTheme();
	const router = useRouter();
	const styles = makeStyles(theme);

	const floatingIcons = [
		{ Icon: BookOpen, x: '15%', y: '20%', delay: 0 },
		{ Icon: Lightbulb, x: '75%', y: '15%', delay: 0.3 },
		{ Icon: Rocket, x: '85%', y: '70%', delay: 0.6 },
	];

	return (
		<Box sx={styles.emptyStateContainer}>
			{/* Floating icons */}
			{floatingIcons.map(({ Icon, x, y, delay }) => (
				<motion.div
					key={delay}
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 0.15, scale: 1, y: [0, -8, 0] }}
					transition={{
						opacity: { duration: 0.5, delay },
						scale: { duration: 0.5, delay },
						y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay },
					}}
					style={{
						position: 'absolute',
						left: x,
						top: y,
						color: theme.palette.primary.light,
					}}>
					<Icon size={32} />
				</motion.div>
			))}

			<Typography variant='h6' sx={styles.emptyStateTitle}>
				No roadmaps yet
			</Typography>
			<Typography variant='body2' sx={styles.emptyStateSubtitle}>
				Create your first learning roadmap by telling us what you want to learn.
			</Typography>
			<Button
				label='Create Your First Roadmap'
				icon={Sparkles}
				iconPos={ButtonIconPositions.START}
				size={ButtonSizes.LARGE}
				onClick={() => router.push('/roadmaps/create')}
			/>
		</Box>
	);
}

function GeneratingCard({ data }: { data: UserRoadmapDto }) {
	const theme = useTheme();
	const { roadmap } = data;
	const isFailed = roadmap.generationStatus === 'failed';

	return (
		<Box
			sx={{
				p: 3,
				borderRadius: 3,
				border: `1px solid ${alpha(
					isFailed ? theme.palette.error.main : theme.palette.primary.main,
					0.2,
				)}`,
				background: alpha(
					isFailed ? theme.palette.error.main : theme.palette.primary.main,
					0.04,
				),
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1.5,
				textAlign: 'center',
			}}>
			{isFailed ? (
				<AlertCircle size={28} color={theme.palette.error.main} />
			) : (
				<CircularProgress size={28} thickness={3} />
			)}
			<Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
				{roadmap.title}
			</Typography>
			<Chip
				size='small'
				label={isFailed ? 'Failed' : 'Generating...'}
				sx={{
					bgcolor: alpha(
						isFailed ? theme.palette.error.main : theme.palette.info.main,
						0.1,
					),
					color: isFailed ? theme.palette.error.main : theme.palette.info.main,
					fontWeight: 600,
				}}
			/>
			{isFailed && roadmap.errorMessage && (
				<Typography variant='caption' color='text.secondary'>
					{roadmap.errorMessage}
				</Typography>
			)}
		</Box>
	);
}

export function RoadmapList() {
	const { data: roadmaps, isLoading, error } = useUserRoadmapsQuery();

	const completedRoadmaps = roadmaps?.filter(
		(r) => r.roadmap.generationStatus === 'completed',
	);
	const generatingRoadmaps = roadmaps?.filter(
		(r) =>
			r.roadmap.generationStatus === 'pending' ||
			r.roadmap.generationStatus === 'processing',
	);
	const failedRoadmaps = roadmaps?.filter(
		(r) => r.roadmap.generationStatus === 'failed',
	);

	const hasCompleted = completedRoadmaps && completedRoadmaps.length > 0;
	const hasGenerating = generatingRoadmaps && generatingRoadmaps.length > 0;
	const hasFailed = failedRoadmaps && failedRoadmaps.length > 0;
	const hasAny = roadmaps && roadmaps.length > 0;

	return (
		<Box>
			{/* Hero is always visible */}
			<RoadmapHero />

			{/* Loading */}
			{isLoading && <Loader variant='page' message='Loading roadmaps' />}

			{/* Error */}
			{!isLoading && error && (
				<ErrorState
					title='Failed to load roadmaps'
					description='Something went wrong while loading your roadmaps.'
					onRetry={() => window.location.reload()}
				/>
			)}

			{/* Empty state */}
			{!isLoading && !error && !hasAny && <EmptyRoadmapState />}

			{/* Generating roadmaps */}
			{!isLoading && !error && (hasGenerating || hasFailed) && (
				<Box sx={{ mb: 3 }}>
					<Grid container spacing={2}>
						{generatingRoadmaps?.map((item) => (
							<Grid key={item.roadmap.id} size={{ xs: 12, sm: 6, lg: 4 }}>
								<GeneratingCard data={item} />
							</Grid>
						))}
						{failedRoadmaps?.map((item) => (
							<Grid key={item.roadmap.id} size={{ xs: 12, sm: 6, lg: 4 }}>
								<GeneratingCard data={item} />
							</Grid>
						))}
					</Grid>
				</Box>
			)}

			{/* Stats + Grid for completed */}
			{!isLoading && !error && hasCompleted && (
				<>
					<RoadmapStats roadmaps={completedRoadmaps} />

					<MotionGrid
						container
						spacing={3}
						variants={staggerContainer}
						initial='hidden'
						animate='visible'>
						{completedRoadmaps.map((item) => (
							<Grid
								key={item.roadmap.id}
								size={{ xs: 12, sm: 6, lg: 4 }}
								component={motion.div}
								variants={staggerItem}>
								<RoadmapCard data={item} />
							</Grid>
						))}
					</MotionGrid>
				</>
			)}
		</Box>
	);
}
