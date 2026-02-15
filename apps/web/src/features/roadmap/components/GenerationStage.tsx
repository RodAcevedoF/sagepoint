'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { makeStyles } from './GenerationStage.styles';

export type StageState = 'pending' | 'active' | 'completed';

export interface GenerationStageData {
	label: string;
	description: string;
	icon: LucideIcon;
}

interface GenerationStageProps extends GenerationStageData {
	state: StageState;
	isLast?: boolean;
}

const MotionBox = motion.create(Box);

export function GenerationStage({
	label,
	description,
	icon: Icon,
	state,
	isLast = false,
}: GenerationStageProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	const stateColors: Record<StageState, string> = {
		pending: theme.palette.text.secondary,
		active: theme.palette.primary.light,
		completed: theme.palette.success.light,
	};

	const color = stateColors[state];
	const isPending = state === 'pending';
	const isCompleted = state === 'completed';

	return (
		<Box sx={styles.container(isPending)}>
			{/* Timeline column */}
			<Box sx={styles.timelineColumn}>
				{/* Dot */}
				<Box sx={styles.dotContainer}>
					{state === 'active' && (
						<MotionBox
							animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							sx={styles.activePulse(color)}
						/>
					)}
					<Box sx={styles.dot(state, color)}>
						{isCompleted ?
							<Check size={14} />
						:	<Icon size={14} />}
					</Box>
				</Box>

				{/* Connector line */}
				{!isLast && <Box sx={styles.connectorLine(isCompleted)} />}
			</Box>

			{/* Label column */}
			<Box sx={styles.labelColumn(isLast)}>
				<Typography variant='body1' sx={styles.label(color)}>
					{label}
				</Typography>
				<Typography variant='caption' sx={styles.description}>
					{description}
				</Typography>
			</Box>
		</Box>
	);
}
