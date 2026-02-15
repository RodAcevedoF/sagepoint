import {
	Box,
	Typography,
	IconButton,
	Chip,
	Tooltip,
	CircularProgress,
	alpha,
	useTheme,
} from '@mui/material';
import {
	Clock,
	ChevronDown,
	PlayCircle,
	CheckCircle2,
	SkipForward,
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
				label: 'Complete',
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
			color: theme.palette.warning.light,
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
		beginner: theme.palette.success.light,
		intermediate: theme.palette.warning.light,
		advanced: theme.palette.error.light,
	};

	const statusInfo = STATUS_LABELS[status];
	const nextAction = getNextAction(status);
	const canSkip =
		status !== StepStatus.SKIPPED && status !== StepStatus.COMPLETED;

	return (
		<Box onClick={onToggle} sx={styles.header}>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box sx={styles.titleRow}>
					<Typography variant='subtitle1' sx={styles.title}>
						{step.concept.name}
					</Typography>
					<Chip size='small' label={`Step ${step.order}`} sx={styles.stepChip} />
					{step.difficulty && (
						<Chip
							size='small'
							label={step.difficulty}
							sx={{
								height: 22,
								fontSize: '0.65rem',
								bgcolor: alpha(
									DIFFICULTY_COLORS[step.difficulty] ||
										theme.palette.text.secondary,
									0.1,
								),
								color:
									DIFFICULTY_COLORS[step.difficulty] ||
									theme.palette.text.secondary,
							}}
						/>
					)}
				</Box>

				{step.concept.description && (
					<Typography variant='body2' sx={styles.description(expanded)}>
						{step.concept.description}
					</Typography>
				)}

				<Box sx={styles.metaRow}>
					<Chip
						size='small'
						label={statusInfo.label}
						sx={styles.statusChip(statusInfo.color)}
					/>
					{step.estimatedDuration && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Clock size={12} color={theme.palette.text.secondary} />
							<Typography
								variant='caption'
								sx={{ color: theme.palette.text.secondary }}>
								{formatDuration(step.estimatedDuration)}
							</Typography>
						</Box>
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
					sx={{ display: 'flex', color: theme.palette.text.secondary }}>
					<ChevronDown size={18} />
				</MotionBox>
			</Box>
		</Box>
	);
}
