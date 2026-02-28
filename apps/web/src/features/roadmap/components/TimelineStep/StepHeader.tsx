import {
	Box,
	Typography,
	IconButton,
	Chip,
	Tooltip,
	CircularProgress,
	useTheme,
} from '@mui/material';
import {
	Clock,
	ChevronDown,
	PlayCircle,
	CheckCircle2,
	SkipForward,
	FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StepStatus, type RoadmapStep } from '@sagepoint/domain';
import { makeStyles } from './TimelineStep.styles';

const MotionBox = motion.create(Box);

interface StepHeaderProps {
	step: RoadmapStep;
	status: StepStatus;
	expanded: boolean;
	onToggle: () => void;
	onStatusChange: (status: StepStatus) => void;
	isLoading: boolean;
	statusColor: string;
	parentDocumentId?: string;
	quizReady?: boolean;
}

function formatDuration(minutes?: number): string {
	if (!minutes) return '';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getNextAction(status: StepStatus) {
	switch (status) {
		case StepStatus.NOT_STARTED:
			return {
				status: StepStatus.IN_PROGRESS,
				label: 'Start',
				icon: PlayCircle,
			};
		case StepStatus.IN_PROGRESS:
			return {
				status: StepStatus.COMPLETED,
				label: 'Take quiz to complete',
				icon: CheckCircle2,
			};
		case StepStatus.SKIPPED:
			return {
				status: StepStatus.IN_PROGRESS,
				label: 'Start',
				icon: PlayCircle,
			};
		default:
			return null;
	}
}

export function StepHeader({
	step,
	status,
	expanded,
	onToggle,
	onStatusChange,
	isLoading,
	statusColor,
	parentDocumentId,
	quizReady,
}: StepHeaderProps) {
	const theme = useTheme();
	const styles = makeStyles(theme, statusColor);

	const STATUS_LABELS: Record<StepStatus, { label: string; color: string }> = {
		[StepStatus.COMPLETED]: {
			label: 'Completed',
			color: theme.palette.success.light,
		},
		[StepStatus.IN_PROGRESS]: {
			label: 'In Progress',
			color: theme.palette.info.light,
		},
		[StepStatus.NOT_STARTED]: {
			label: 'New',
			color: theme.palette.primary.light,
		},
		[StepStatus.SKIPPED]: {
			label: 'Skipped',
			color: theme.palette.text.secondary,
		},
	};

	const DIFFICULTY_COLORS: Record<string, string> = {
		beginner: theme.palette.difficulty.beginner,
		intermediate: theme.palette.difficulty.intermediate,
		advanced: theme.palette.difficulty.advanced,
		expert: theme.palette.difficulty.expert,
	};

	const statusInfo = STATUS_LABELS[status];
	const nextAction = getNextAction(status);
	const canSkip =
		status !== StepStatus.SKIPPED && status !== StepStatus.COMPLETED;
	const isExternal =
		parentDocumentId &&
		step.concept.documentId &&
		step.concept.documentId !== parentDocumentId;

	return (
		<Box onClick={onToggle} sx={styles.header}>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box sx={styles.titleRow}>
					<Typography variant='subtitle1' sx={styles.title}>
						{step.concept.name}
					</Typography>
					<Typography sx={styles.stepId}>
						#{step.concept.id.split('-')[0]}
					</Typography>
					<Chip
						size='small'
						label={`Step ${step.order}`}
						sx={styles.stepChip}
					/>
					{isExternal && (
						<Chip
							size='small'
							icon={<FileText size={12} />}
							label='External Source'
							sx={styles.externalSourceChip}
						/>
					)}

					{step.difficulty && (
						<Chip
							size='small'
							label={step.difficulty}
							sx={styles.difficultyChip(
								DIFFICULTY_COLORS[step.difficulty] ||
									theme.palette.text.secondary,
							)}
						/>
					)}
				</Box>

				{step.concept.description && (
					<Box sx={styles.descriptionWrapper}>
						<Typography sx={styles.description(expanded)}>
							{step.concept.description}
						</Typography>
					</Box>
				)}

				<Box sx={styles.metaRow}>
					<Chip
						size='small'
						label={statusInfo.label}
						sx={styles.statusChip(statusInfo.color)}
					/>
					{step.estimatedDuration && (
						<Box sx={styles.durationContainer}>
							<Clock size={12} color={theme.palette.text.secondary} />
							<Typography variant='subtitle2' sx={styles.durationText}>
								{formatDuration(step.estimatedDuration)}
							</Typography>
						</Box>
					)}
					{quizReady && status === StepStatus.IN_PROGRESS && (
						<Chip size='small' label='Quiz Ready' sx={styles.quizReadyChip} />
					)}
				</Box>
			</Box>

			<Box sx={styles.actionsContainer}>
				{isLoading ?
					<CircularProgress size={20} />
				:	<>
						{nextAction && (
							<Tooltip title={nextAction.label}>
								<IconButton
									size='small'
									onClick={(e) => {
										e.stopPropagation();
										onStatusChange(nextAction.status);
									}}
									sx={styles.actionButton}>
									<nextAction.icon size={18} />
								</IconButton>
							</Tooltip>
						)}
						{canSkip && (
							<Tooltip title='Skip'>
								<IconButton
									size='small'
									onClick={(e) => {
										e.stopPropagation();
										onStatusChange(StepStatus.SKIPPED);
									}}
									sx={styles.skipButton}>
									<SkipForward size={16} />
								</IconButton>
							</Tooltip>
						)}
					</>
				}
				<MotionBox
					animate={{ rotate: expanded ? 180 : 0 }}
					transition={{ duration: 0.25 }}
					sx={styles.chevronContainer}>
					<ChevronDown size={18} />
				</MotionBox>
			</Box>
		</Box>
	);
}
