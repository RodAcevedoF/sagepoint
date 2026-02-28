'use client';

import { useState } from 'react';
import { Box, alpha, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { StepStatus, type RoadmapStep } from '@sagepoint/domain';
import {
	useUpdateProgressCommand,
	useExpandConceptCommand,
	useStepQuizCommand,
} from '@/application/roadmap';
import type { PreGeneratedQuiz } from '@/application/roadmap/commands/step-quiz.command';
import { useModal, useSnackbar } from '@/common/components';
import type { ResourceDto } from '@/infrastructure/api/roadmapApi';
import { makeStyles } from './TimelineStep.styles';
import { StepIndicator } from './StepIndicator';
import { StepHeader } from './StepHeader';
import { StepContent } from './StepContent';
import { StepQuizModal } from '../StepQuizModal/StepQuizModal';

const MotionBox = motion.create(Box);

interface TimelineStepProps {
	step: RoadmapStep;
	roadmapId: string;
	status: StepStatus;
	resources: ResourceDto[];
	resourcesLoading?: boolean;
	isLast?: boolean;
	index: number;
	parentDocumentId?: string;
}

export function TimelineStep({
	step,
	roadmapId,
	status,
	resources,
	resourcesLoading,
	isLast = false,
	index,
	parentDocumentId,
}: TimelineStepProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery('(max-width:625px)');
	const { openModal, closeModal } = useModal();
	const { showSnackbar } = useSnackbar();

	const [expanded, setExpanded] = useState(false);
	const [preGeneratedQuiz, setPreGeneratedQuiz] =
		useState<PreGeneratedQuiz | null>(null);
	const [quizReady, setQuizReady] = useState(false);
	const { execute: updateProgress, isLoading } = useUpdateProgressCommand();
	const { execute: expandConcept, isLoading: expandLoading } =
		useExpandConceptCommand();
	const { generate } = useStepQuizCommand();

	const handleExpand = async () => {
		try {
			await expandConcept(roadmapId, step.concept.id);
			showSnackbar('Sub-concepts added to your roadmap', {
				severity: 'success',
			});
		} catch {
			showSnackbar('Failed to expand concept', { severity: 'error' });
		}
	};

	const STATUS_DOT_COLORS: Record<StepStatus, string> = {
		[StepStatus.NOT_STARTED]: theme.palette.text.secondary,
		[StepStatus.IN_PROGRESS]: theme.palette.warning.light,
		[StepStatus.COMPLETED]: theme.palette.success.light,
		[StepStatus.SKIPPED]: alpha(theme.palette.text.secondary, 0.5),
	};

	const dotColor = STATUS_DOT_COLORS[status];
	const styles = makeStyles(theme, dotColor);

	const handleStatusChange = async (newStatus: StepStatus) => {
		// Intercept completion: require quiz pass
		if (
			newStatus === StepStatus.COMPLETED &&
			status === StepStatus.IN_PROGRESS
		) {
			openModal(
				<StepQuizModal
					roadmapId={roadmapId}
					conceptId={step.concept.id}
					conceptName={step.concept.name}
					preGeneratedQuiz={preGeneratedQuiz}
					onClose={() => {
						setPreGeneratedQuiz(null);
						setQuizReady(false);
						closeModal();
					}}
				/>,
				{
					title: `Quiz: ${step.concept.name}`,
					maxWidth: 'sm',
					showCloseButton: true,
					closeOnOverlay: false,
				},
			);
			return;
		}

		try {
			await updateProgress(roadmapId, step.concept.id, newStatus);

			// Pre-generate quiz when starting a step (fire-and-forget)
			if (newStatus === StepStatus.IN_PROGRESS) {
				generate(roadmapId, step.concept.id)
					.then((data) => {
						setPreGeneratedQuiz(data);
						setQuizReady(true);
					})
					.catch((err: unknown) => {
						console.warn('Quiz pre-generation failed, will generate on demand:', err);
					});
			}
		} catch (error) {
			console.error('Failed to update progress:', error);
		}
	};

	const handleToggle = () => {
		if (isMobile) {
			openModal(
				<Box sx={{ p: { xs: 0, sm: 1 } }}>
					<StepContent
						step={step}
						resources={resources}
						resourcesLoading={resourcesLoading}
						statusColor={dotColor}
						onExpand={handleExpand}
						expandLoading={expandLoading}
					/>
				</Box>,
				{
					title: step.concept.name,
					maxWidth: 'lg',
					showCloseButton: true,
				},
			);
		} else {
			setExpanded((prev) => !prev);
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
						onToggle={handleToggle}
						onStatusChange={handleStatusChange}
						isLoading={isLoading}
						statusColor={dotColor}
						parentDocumentId={parentDocumentId}
						quizReady={quizReady}
					/>

					<AnimatePresence>
						{expanded && !isMobile && (
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
									onExpand={handleExpand}
									expandLoading={expandLoading}
								/>
							</MotionBox>
						)}
					</AnimatePresence>
				</Box>
			</Box>
		</MotionBox>
	);
}
