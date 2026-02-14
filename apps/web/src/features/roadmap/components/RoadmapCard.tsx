'use client';

import { Box, Typography, Chip, alpha, CircularProgress } from '@mui/material';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';

interface RoadmapCardProps {
	data: UserRoadmapDto;
}

const STATUS_CONFIG = {
	completed: { label: 'Completed', color: palette.success.light },
	inProgress: { label: 'In Progress', color: palette.warning.light },
	new: { label: 'New', color: palette.primary.light },
} as const;

const DIFFICULTY_COLORS: Record<string, string> = {
	beginner: palette.success.light,
	intermediate: palette.warning.light,
	advanced: palette.error.light,
};

function getStatus(progress: UserRoadmapDto['progress']) {
	if (progress.progressPercentage === 100) return STATUS_CONFIG.completed;
	if (progress.inProgressSteps > 0 || progress.completedSteps > 0)
		return STATUS_CONFIG.inProgress;
	return STATUS_CONFIG.new;
}

function formatDuration(minutes?: number): string {
	if (!minutes) return 'Flexible';
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatRelativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	return `${months}mo ago`;
}

function getDifficultyDistribution(steps: UserRoadmapDto['roadmap']['steps']) {
	const counts: Record<string, number> = {};
	for (const step of steps) {
		if (step.difficulty) {
			counts[step.difficulty] = (counts[step.difficulty] || 0) + 1;
		}
	}
	return counts;
}

export function RoadmapCard({ data }: RoadmapCardProps) {
	const router = useRouter();
	const { roadmap, progress } = data;
	const status = getStatus(progress);
	const difficultyDist = getDifficultyDistribution(roadmap.steps);

	return (
		<Card
			onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
			variant='glass'>
			<Card.Content>
				{/* Top row: Title + Progress ring */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: 2,
						mb: 2,
					}}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box
							sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
							<Typography
								variant='h6'
								sx={{
									fontWeight: 600,
									color: palette.text.primary,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}>
								{roadmap.title}
							</Typography>
						</Box>
						{roadmap.description && (
							<Typography
								variant='body2'
								sx={{
									color: palette.text.secondary,
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}>
								{roadmap.description}
							</Typography>
						)}
					</Box>

					{/* Circular progress ring */}
					<Box
						sx={{ position: 'relative', flexShrink: 0, width: 52, height: 52 }}>
						{/* Track */}
						<CircularProgress
							variant='determinate'
							value={100}
							size={52}
							thickness={3}
							sx={{
								position: 'absolute',
								color: alpha(palette.primary.main, 0.1),
							}}
						/>
						{/* Value */}
						<CircularProgress
							variant='determinate'
							value={progress.progressPercentage}
							size={52}
							thickness={3}
							sx={{
								position: 'absolute',
								color: status.color,
							}}
						/>
						<Box
							sx={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
							<Typography
								variant='caption'
								sx={{
									fontWeight: 700,
									color: status.color,
									fontSize: '0.7rem',
								}}>
								{progress.progressPercentage}%
							</Typography>
						</Box>
					</Box>
				</Box>

				{/* Status badge */}
				<Box sx={{ mb: 2 }}>
					<Chip
						size='small'
						label={status.label}
						sx={{
							height: 22,
							fontSize: '0.65rem',
							fontWeight: 600,
							bgcolor: alpha(status.color, 0.12),
							color: status.color,
						}}
					/>
				</Box>

				{/* Stats row */}
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<BookOpen size={14} color={palette.text.secondary} />
						<Typography
							variant='caption'
							sx={{ color: palette.text.secondary }}>
							{progress.completedSteps}/{progress.totalSteps} steps
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Clock size={14} color={palette.text.secondary} />
						<Typography
							variant='caption'
							sx={{ color: palette.text.secondary }}>
							{formatDuration(roadmap.totalEstimatedDuration)}
						</Typography>
					</Box>
				</Box>

				{/* Difficulty chips */}
				{Object.keys(difficultyDist).length > 0 && (
					<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
						{Object.entries(difficultyDist).map(([difficulty, count]) => (
							<Chip
								key={difficulty}
								size='small'
								label={`${count} ${difficulty}`}
								sx={{
									height: 20,
									fontSize: '0.6rem',
									bgcolor: alpha(
										DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
										0.1,
									),
									color:
										DIFFICULTY_COLORS[difficulty] || palette.text.secondary,
								}}
							/>
						))}
					</Box>
				)}
			</Card.Content>

			<Card.Footer>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
					<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
						{roadmap.recommendedPace && (
							<Chip
								size='small'
								label={roadmap.recommendedPace}
								sx={{
									height: 20,
									fontSize: '0.6rem',
									bgcolor: alpha(palette.info.main, 0.1),
									color: palette.info.light,
								}}
							/>
						)}
						<Typography
							variant='caption'
							sx={{ color: alpha(palette.text.secondary, 0.6) }}>
							{formatRelativeTime(roadmap.createdAt)}
						</Typography>
					</Box>
					<ArrowRight size={16} color={palette.text.secondary} />
				</Box>
			</Card.Footer>
		</Card>
	);
}
