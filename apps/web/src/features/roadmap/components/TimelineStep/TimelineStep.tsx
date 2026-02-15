'use client';

import { useState } from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { StepStatus, type RoadmapStep } from '@sagepoint/domain';
import { useUpdateProgressCommand } from '@/application/roadmap';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { makeStyles } from './TimelineStep.styles';
import { StepIndicator } from './StepIndicator';
import { StepHeader } from './StepHeader';
import { StepContent } from './StepContent';

const MotionBox = motion.create(Box);

interface TimelineStepProps {
	step: RoadmapStep;
	roadmapId: string;
	status: StepStatus;
	resources: ResourceDto[];
	resourcesLoading?: boolean;
	isLast?: boolean;
	index: number;
}

export function TimelineStep({
	step,
	roadmapId,
	status,
	resources,
	resourcesLoading,
	isLast = false,
	index,
}: TimelineStepProps) {
	const theme = useTheme();
	const [expanded, setExpanded] = useState(false);
	const { execute: updateProgress, isLoading } = useUpdateProgressCommand();

	const STATUS_DOT_COLORS: Record<StepStatus, string> = {
		[StepStatus.NOT_STARTED]: theme.palette.text.secondary,
		[StepStatus.IN_PROGRESS]: theme.palette.warning.light,
		[StepStatus.COMPLETED]: theme.palette.success.light,
		[StepStatus.SKIPPED]: alpha(theme.palette.text.secondary, 0.5),
	};

	const dotColor = STATUS_DOT_COLORS[status];
	const styles = makeStyles(theme, dotColor);

	const handleStatusChange = async (newStatus: StepStatus) => {
		try {
			await updateProgress(roadmapId, step.concept.id, newStatus);
		} catch (error) {
			console.error('Failed to update progress:', error);
		}
	};

	return (
		<MotionBox
			initial={{ opacity: 0, x: -24 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
			sx={styles.container}>
			<StepIndicator
				order={step.order}
				isCompleted={status === StepStatus.COMPLETED}
				isActive={status === StepStatus.IN_PROGRESS}
				isLast={isLast}
				statusColor={dotColor}
			/>

			<Box sx={{ flex: 1, pb: isLast ? 0 : 3 }}>
				<Box sx={styles.card}>
					<StepHeader
						step={step}
						status={status}
						expanded={expanded}
						onToggle={() => setExpanded((prev) => !prev)}
						onStatusChange={handleStatusChange}
						isLoading={isLoading}
						statusColor={dotColor}
					/>

					<AnimatePresence>
						{expanded && (
							<MotionBox
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3, ease: 'easeInOut' }}
								sx={{ overflow: 'hidden' }}>
								<StepContent
									step={step}
									resources={resources}
									resourcesLoading={resourcesLoading}
									statusColor={dotColor}
								/>
							</MotionBox>
						)}
					</AnimatePresence>
				</Box>
			</Box>
		</MotionBox>
	);
}
