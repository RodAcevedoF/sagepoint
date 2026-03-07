'use client';

import { useMemo, useState } from 'react';
import {
	alpha,
	Box,
	Grid,
	Typography,
	Chip,
	type Theme,
	type SxProps,
} from '@mui/material';
import { Compass, Globe, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePublicRoadmapsQuery } from '@/application/roadmap';
import { useCategoriesQuery } from '@/application/onboarding/queries/get-categories.query';
import { ErrorState } from '@/common/components';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import { RoadmapCardSkeleton } from './RoadmapCardSkeleton';
import { CategoryFilter } from './CategoryFilter';
import {
	formatDuration,
	formatRelativeTime,
	getDifficultyDistribution,
	DIFFICULTY_COLORS,
} from '../utils/roadmap.utils';

import type { RoadmapDto } from '@/infrastructure/api/roadmapApi';

const MotionBox = motion.create(Box);
const MotionGrid = motion.create(Grid);

const staggerContainer = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.3 },
	},
};

const staggerItem = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const makeStyles = (): Record<string, SxProps<Theme>> => ({
	heroContainer: {
		mb: 6,
		position: 'relative',
	},
	heroContent: {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: 8,
		p: { xs: 5, md: 8 },
		background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
		backdropFilter: 'blur(16px)',
		border: `1px solid ${alpha(palette.secondary.light, 0.1)}`,
		boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
	},
	gradientOrb: {
		position: 'absolute',
		top: -120,
		right: -120,
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.secondary.main, 0.15)} 0%, transparent 70%)`,
		filter: 'blur(60px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	title: {
		fontWeight: 900,
		mb: 2,
		background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.secondary.light} 50%, ${palette.success.light} 100%)`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		fontSize: { xs: '2.5rem', md: '3.5rem' },
		letterSpacing: '-1.5px',
		lineHeight: 1.1,
		position: 'relative',
		zIndex: 1,
	},
	subtitle: {
		color: palette.text.secondary,
		mb: 2,
		maxWidth: 540,
		fontSize: '1.1rem',
		lineHeight: 1.6,
		position: 'relative',
		zIndex: 1,
		opacity: 0.9,
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 1,
		px: 2,
		py: 0.5,
		borderRadius: 100,
		bgcolor: alpha(palette.secondary.main, 0.1),
		border: `1px solid ${alpha(palette.secondary.main, 0.2)}`,
		color: palette.secondary.light,
		mb: 3,
		fontSize: '0.75rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '1px',
		position: 'relative',
		zIndex: 1,
	},
	emptyState: {
		textAlign: 'center',
		py: 10,
	},
});

interface ExploreCardProps {
	roadmap: RoadmapDto;
}

function ExploreCard({ roadmap }: ExploreCardProps) {
	const router = useRouter();
	const difficultyDist = getDifficultyDistribution(roadmap.steps);

	return (
		<Card
			onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
			sx={{
				cursor: 'pointer',
				transition: 'all 0.3s ease',
				'&:hover': { transform: 'translateY(-4px)' },
			}}
			variant='glass'>
			<Card.Content>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
					<Globe size={14} color={palette.success.main} />
					<Typography variant='caption' sx={{ color: palette.success.main, fontWeight: 700 }}>
						Public
					</Typography>
				</Box>
				<Typography variant='h6' sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.3px' }}>
					{roadmap.title}
				</Typography>
				{roadmap.description && (
					<Typography
						variant='body2'
						sx={{
							color: palette.text.secondary,
							mb: 2,
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}>
						{roadmap.description}
					</Typography>
				)}

				<Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
					<Chip
						size='small'
						icon={<BookOpen size={14} />}
						label={`${roadmap.steps.length} steps`}
						sx={{
							bgcolor: alpha(palette.info.main, 0.1),
							color: palette.info.light,
							fontWeight: 600,
							fontSize: '0.8rem',
							border: 'none',
						}}
					/>
					{roadmap.totalEstimatedDuration && (
						<Chip
							size='small'
							label={formatDuration(roadmap.totalEstimatedDuration)}
							sx={{
								bgcolor: alpha(palette.text.secondary, 0.08),
								color: palette.text.secondary,
								fontWeight: 600,
								fontSize: '0.8rem',
								border: 'none',
							}}
						/>
					)}
				</Box>

				{Object.keys(difficultyDist).length > 0 && (
					<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
						{Object.entries(difficultyDist).map(([difficulty, count]) => (
							<Chip
								key={difficulty}
								size='small'
								label={`${count} ${difficulty}`}
								sx={{
									height: 22,
									fontSize: '0.7rem',
									fontWeight: 600,
									bgcolor: alpha(
										DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
										0.1,
									),
									color: DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
									border: 'none',
								}}
							/>
						))}
					</Box>
				)}
			</Card.Content>

			<Card.Footer>
				<Typography variant='caption' sx={{ color: palette.text.secondary }}>
					{formatRelativeTime(roadmap.createdAt)}
				</Typography>
			</Card.Footer>
		</Card>
	);
}

export function ExploreRoadmaps() {
	const { data: roadmaps, isLoading, error } = usePublicRoadmapsQuery();
	const { data: categories } = useCategoriesQuery();
	const styles = makeStyles();
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const filteredRoadmaps = useMemo(() => {
		if (!roadmaps) return undefined;
		if (!selectedCategory) return roadmaps;
		return roadmaps.filter((r) => r.categoryId === selectedCategory);
	}, [roadmaps, selectedCategory]);

	const usedCategories = useMemo(() => {
		if (!roadmaps || !categories) return [];
		const usedCategoryIds = new Set(
			roadmaps.map((r) => r.categoryId).filter(Boolean),
		);
		return categories.filter((c) => usedCategoryIds.has(c.id));
	}, [roadmaps, categories]);

	return (
		<Box>
			<MotionBox
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
				sx={styles.heroContainer}>
				<Box sx={styles.heroContent}>
					<Box sx={styles.gradientOrb} />

					<Box sx={styles.badge}>
						<Compass size={14} />
						Community
					</Box>

					<Typography variant='h3' sx={styles.title}>
						Explore Roadmaps
					</Typography>

					<Typography variant='body1' sx={styles.subtitle}>
						Discover learning paths shared by the community. Find inspiration and
						start learning from curated roadmaps.
					</Typography>
				</Box>
			</MotionBox>

			{usedCategories.length > 0 && !isLoading && (
				<CategoryFilter
					categories={usedCategories}
					selectedCategory={selectedCategory}
					onSelect={setSelectedCategory}
				/>
			)}

			{isLoading && (
				<Grid container spacing={3}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
							<RoadmapCardSkeleton />
						</Grid>
					))}
				</Grid>
			)}

			{!isLoading && error && (
				<ErrorState
					title='Failed to load roadmaps'
					description='Something went wrong while loading public roadmaps.'
					onRetry={() => window.location.reload()}
				/>
			)}

			{!isLoading && !error && filteredRoadmaps && filteredRoadmaps.length === 0 && (
				<Box sx={styles.emptyState}>
					<Globe size={48} color={palette.text.secondary} style={{ opacity: 0.3, marginBottom: 16 }} />
					<Typography variant='h6' sx={{ color: palette.text.secondary, mb: 1 }}>
						No public roadmaps yet
					</Typography>
					<Typography variant='body2' sx={{ color: palette.text.secondary, opacity: 0.7 }}>
						Be the first to share a roadmap with the community!
					</Typography>
				</Box>
			)}

			{!isLoading && !error && filteredRoadmaps && filteredRoadmaps.length > 0 && (
				<MotionGrid
					container
					spacing={3}
					variants={staggerContainer}
					initial='hidden'
					animate='visible'>
					{filteredRoadmaps.map((roadmap) => (
						<Grid
							key={roadmap.id}
							size={{ xs: 12, sm: 6, lg: 4 }}
							component={motion.div}
							variants={staggerItem}>
							<ExploreCard roadmap={roadmap} />
						</Grid>
					))}
				</MotionGrid>
			)}
		</Box>
	);
}
