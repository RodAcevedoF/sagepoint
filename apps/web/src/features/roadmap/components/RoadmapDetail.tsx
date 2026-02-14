'use client';

import { useMemo } from 'react';
import { Box, Typography, Chip, CircularProgress, alpha } from '@mui/material';
import { Clock, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StepStatus } from '@sagepoint/domain';
import { useRoadmapWithProgressQuery } from '@/application/roadmap';
import { EmptyState, ErrorState, Loader, Button } from '@/common/components';
import { palette } from '@/common/theme';
import { ButtonVariants, ButtonIconPositions } from '@/common/types';
import { TimelineStep } from './TimelineStep';

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
	const router = useRouter();
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
		return <Loader variant="page" message="Loading roadmap" />;
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
		<Box>
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
				sx={{
					mb: 5,
					p: { xs: 3, md: 4 },
					borderRadius: 6,
					position: 'relative',
					overflow: 'hidden',
					background: alpha(palette.background.paper, 0.4),
					backdropFilter: 'blur(12px)',
					border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
				}}>
				{/* Gradient accent bar */}
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: 4,
						background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.accent}, ${palette.info.main})`,
					}}
				/>

				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: 3,
						alignItems: 'flex-start',
					}}>
					{/* Text content */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant='h4'
							sx={{
								fontWeight: 700,
								mb: 1,
								background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.accent})`,
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
							}}>
							{roadmap.title}
						</Typography>
						{roadmap.description && (
							<Typography
								variant='body1'
								sx={{ color: palette.text.secondary, mb: 3 }}>
								{roadmap.description}
							</Typography>
						)}

						{/* Stats */}
						<Box
							sx={{
								display: 'flex',
								gap: 3,
								flexWrap: 'wrap',
								alignItems: 'center',
							}}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<BookOpen size={18} color={palette.text.secondary} />
								<Typography
									variant='body2'
									sx={{ color: palette.text.secondary }}>
									<Box
										component='span'
										sx={{ color: palette.text.primary, fontWeight: 600 }}>
										{progress.completedSteps}
									</Box>
									/{progress.totalSteps} steps completed
								</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Clock size={18} color={palette.text.secondary} />
								<Typography
									variant='body2'
									sx={{ color: palette.text.secondary }}>
									Est. {formatDuration(roadmap.totalEstimatedDuration)}
								</Typography>
							</Box>
							{roadmap.recommendedPace && (
								<Chip
									size='small'
									icon={<Zap size={14} />}
									label={roadmap.recommendedPace}
									sx={{
										bgcolor: alpha(palette.info.main, 0.1),
										color: palette.info.light,
										'& .MuiChip-icon': { color: palette.info.light },
									}}
								/>
							)}
						</Box>
					</Box>

					{/* Large circular progress */}
					<Box
						sx={{
							position: 'relative',
							flexShrink: 0,
							width: 100,
							height: 100,
							display: { xs: 'none', sm: 'block' },
						}}>
						<CircularProgress
							variant='determinate'
							value={100}
							size={100}
							thickness={3}
							sx={{
								position: 'absolute',
								color: alpha(palette.primary.main, 0.1),
							}}
						/>
						<CircularProgress
							variant='determinate'
							value={progress.progressPercentage}
							size={100}
							thickness={3}
							sx={{
								position: 'absolute',
								color:
									progress.progressPercentage === 100 ?
										palette.success.light
									:	palette.primary.light,
							}}
						/>
						<Box
							sx={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
							<Typography
								variant='h5'
								sx={{
									fontWeight: 700,
									color: palette.text.primary,
									lineHeight: 1,
								}}>
								{progress.progressPercentage}%
							</Typography>
							<Typography
								variant='caption'
								sx={{ color: palette.text.secondary, fontSize: '0.6rem' }}>
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
			:	<Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
