'use client';

import { useMemo } from 'react';
import {
	Box,
	Typography,
	Chip,
	CircularProgress,
	useTheme,
} from '@mui/material';
import { Clock, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepStatus } from '@sagepoint/domain';
import { useRoadmapWithProgressQuery } from '@/application/roadmap';
import { EmptyState, ErrorState, Loader, Button } from '@/common/components';
import { ButtonVariants, ButtonIconPositions } from '@/common/types';
import { TimelineStep } from './TimelineStep/TimelineStep';
import { makeStyles } from './RoadmapDetail.styles';

const MotionBox = motion.create(Box);

interface RoadmapDetailProps {
	roadmapId: string;
}

function formatDuration(minutes?: number): string {
	if (!minutes) return 'Flexible';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function groupResourcesByConceptId<T extends { conceptId: string }>(
	resources: T[],
): Record<string, T[]> {
	return resources.reduce(
		(acc, resource) => {
			if (!acc[resource.conceptId]) acc[resource.conceptId] = [];
			acc[resource.conceptId].push(resource);
			return acc;
		},
		{} as Record<string, T[]>,
	);
}

export function RoadmapDetail({ roadmapId }: RoadmapDetailProps) {
	const theme = useTheme();
	const router = useRouter();
	const styles = makeStyles(theme);
	const {
		data: roadmapData,
		isLoading: roadmapLoading,
		error: roadmapError,
	} = useRoadmapWithProgressQuery(roadmapId);

	const resourcesByConceptId = useMemo(
		() =>
			roadmapData?.resources ?
				groupResourcesByConceptId(roadmapData.resources)
			:	{},
		[roadmapData],
	);

	if (roadmapLoading) {
		return <Loader variant='page' message='Loading roadmap' />;
	}

	if (roadmapError || !roadmapData) {
		return (
			<ErrorState
				title='Roadmap not found'
				description="The roadmap you're looking for doesn't exist or you don't have access to it."
				onRetry={() => router.push('/roadmaps')}
				retryLabel='Back to Roadmaps'
			/>
		);
	}

	const { roadmap, progress, stepProgress } = roadmapData;
	const orderedSteps = [...(roadmap.steps || [])].sort(
		(a, b) => a.order - b.order,
	);

	return (
		<Box sx={styles.container}>
			{/* Back Button */}
			<Box sx={{ mb: 3 }}>
				<Button
					label='Back to Roadmaps'
					icon={ArrowLeft}
					iconPos={ButtonIconPositions.START}
					variant={ButtonVariants.GHOST}
					onClick={() => router.push('/roadmaps')}
				/>
			</Box>

			{/* Header Card */}
			<MotionBox
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				sx={styles.headerCard}>
				{/* Gradient accent bar */}
				<Box sx={styles.accentBar} />

				<Box sx={styles.headerContent}>
					{/* Text content */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant='h4' sx={styles.title}>
							{roadmap.title}
						</Typography>
						{roadmap.description && (
							<Typography variant='body1' sx={styles.description}>
								{roadmap.description}
							</Typography>
						)}

						{/* Stats */}
						<Box sx={styles.metaRow}>
							<Box sx={styles.metaItem}>
								<BookOpen size={18} color={theme.palette.text.secondary} />
								<Typography
									variant='body2'
									sx={{ color: theme.palette.text.secondary }}>
									<Box component='span' sx={styles.metaValue}>
										{progress.completedSteps}
									</Box>
									/{progress.totalSteps} steps completed
								</Typography>
							</Box>
							<Box sx={styles.metaItem}>
								<Clock size={18} color={theme.palette.text.secondary} />
								<Typography
									variant='body2'
									sx={{ color: theme.palette.text.secondary }}>
									Est. {formatDuration(roadmap.totalEstimatedDuration)}
								</Typography>
							</Box>
							{roadmap.recommendedPace && (
								<Chip
									size='small'
									icon={<Zap size={14} />}
									label={roadmap.recommendedPace}
									sx={styles.paceChip}
								/>
							)}
						</Box>
					</Box>

					{/* Large circular progress */}
					<Box sx={styles.progressCircleContainer}>
						<CircularProgress
							variant='determinate'
							value={100}
							size={100}
							thickness={3}
							sx={styles.progressCircleBackground}
						/>
						<CircularProgress
							variant='determinate'
							value={progress.progressPercentage}
							size={100}
							thickness={3}
							sx={styles.progressCircleForeground(progress.progressPercentage)}
						/>
						<Box sx={styles.progressLabelContainer}>
							<Typography variant='h5' sx={styles.progressPercentage}>
								{progress.progressPercentage}%
							</Typography>
							<Typography variant='caption' sx={styles.progressLabel}>
								complete
							</Typography>
						</Box>
					</Box>
				</Box>
			</MotionBox>

			{/* Timeline */}
			{orderedSteps.length === 0 ?
				<EmptyState
					title='No steps yet'
					description="This roadmap doesn't have any steps defined."
				/>
			:	<Box sx={styles.timelineContainer}>
					{orderedSteps.map((step, index) => (
						<TimelineStep
							key={step.concept.id}
							step={step}
							roadmapId={roadmapId}
							status={stepProgress[step.concept.id] || StepStatus.NOT_STARTED}
							resources={resourcesByConceptId[step.concept.id] || []}
							resourcesLoading={false}
							isLast={index === orderedSteps.length - 1}
							index={index}
						/>
					))}
				</Box>
			}
		</Box>
	);
}
