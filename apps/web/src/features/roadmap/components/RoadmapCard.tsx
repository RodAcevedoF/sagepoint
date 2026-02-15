'use client';

import {
	Box,
	Typography,
	Chip,
	alpha,
	CircularProgress,
	useTheme,
} from '@mui/material';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import { makeStyles } from './RoadmapCard.styles';

import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';
import {
	DIFFICULTY_COLORS,
	formatDuration,
	formatRelativeTime,
	getDifficultyDistribution,
	getStatus,
} from '../utils/roadmap.utils';

interface RoadmapCardProps {
	data: UserRoadmapDto;
}

export function RoadmapCard({ data }: RoadmapCardProps) {
	const router = useRouter();
	const theme = useTheme();
	const { roadmap, progress } = data;
	const status = getStatus(progress);
	const difficultyDist = getDifficultyDistribution(roadmap.steps);

	const styles = makeStyles(status.color, theme);

	return (
		<Card
			onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
			sx={styles.card}
			variant='glass'>
			<Card.Content>
				{/* Top row: Title + Progress ring */}
				<Box sx={styles.header}>
					<Box sx={styles.headerContent}>
						<Box sx={styles.titleContainer}>
							<Typography variant='h6' sx={styles.title}>
								{roadmap.title}
							</Typography>
						</Box>
						{roadmap.description && (
							<Typography variant='body2' sx={styles.description}>
								{roadmap.description}
							</Typography>
						)}
					</Box>

					{/* Circular progress ring */}
					<Box sx={styles.progressContainer}>
						{/* Track */}
						<CircularProgress
							variant='determinate'
							value={100}
							size={52}
							thickness={3}
							sx={styles.progressTrack}
						/>
						{/* Value */}
						<CircularProgress
							variant='determinate'
							value={progress.progressPercentage}
							size={52}
							thickness={3}
							sx={styles.progressValue}
						/>
						<Box sx={styles.progressCenter}>
							<Typography variant='caption' sx={styles.progressText}>
								{progress.progressPercentage}%
							</Typography>
						</Box>
					</Box>
				</Box>

				{/* Status badge */}
				<Box sx={styles.statusBadge}>
					<Chip size='small' label={status.label} sx={styles.statusChip} />
				</Box>

				{/* Stats row */}
				<Box sx={styles.statsRow}>
					<Box sx={styles.statItem}>
						<BookOpen size={14} color={theme.palette.text.secondary} />
						<Typography variant='caption' sx={styles.statText}>
							{progress.completedSteps}/{progress.totalSteps} steps
						</Typography>
					</Box>
					<Box sx={styles.statItem}>
						<Clock size={14} color={theme.palette.text.secondary} />
						<Typography variant='caption' sx={styles.statText}>
							{formatDuration(roadmap.totalEstimatedDuration)}
						</Typography>
					</Box>
				</Box>

				{/* Difficulty chips */}
				{Object.keys(difficultyDist).length > 0 && (
					<Box sx={styles.difficultyRow}>
						{Object.entries(difficultyDist).map(([difficulty, count]) => (
							<Chip
								key={difficulty}
								size='small'
								label={`${count} ${difficulty}`}
								sx={{
									...styles.difficultyChip,
									bgcolor: alpha(
										DIFFICULTY_COLORS[difficulty] ||
											theme.palette.text.secondary,
										0.1,
									),
									color:
										DIFFICULTY_COLORS[difficulty] ||
										theme.palette.text.secondary,
								}}
							/>
						))}
					</Box>
				)}
			</Card.Content>

			<Card.Footer>
				<Box sx={styles.footerContent}>
					<Box sx={styles.footerInfo}>
						{roadmap.recommendedPace && (
							<Chip
								size='small'
								label={roadmap.recommendedPace}
								sx={styles.paceChip}
							/>
						)}
						<Typography variant='caption' sx={styles.relativeTime}>
							{formatRelativeTime(roadmap.createdAt)}
						</Typography>
					</Box>
					<ArrowRight size={16} color={theme.palette.text.secondary} />
				</Box>
			</Card.Footer>
		</Card>
	);
}
