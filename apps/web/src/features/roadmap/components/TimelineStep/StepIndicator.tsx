import { Box, Typography, useTheme } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { makeStyles } from './TimelineStep.styles';

const MotionBox = motion.create(Box);

interface StepIndicatorProps {
	order: number;
	isCompleted: boolean;
	isActive: boolean;
	isLast: boolean;
	statusColor: string;
}

export function StepIndicator({
	order,
	isCompleted,
	isActive,
	isLast,
	statusColor,
}: StepIndicatorProps) {
	const theme = useTheme();
	const styles = makeStyles(theme, statusColor);

	return (
		<Box sx={styles.indicatorColumn}>
			<Box sx={styles.dotContainer}>
				{isActive && (
					<MotionBox
						animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
						sx={styles.pulseRing}
					/>
				)}
				<Box sx={styles.dot(isCompleted)}>
					{isCompleted ?
						<CheckCircle2 size={20} />
					:	<Typography
							variant='caption'
							sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
							{order}
						</Typography>
					}
				</Box>
			</Box>
			{!isLast && <Box sx={styles.connector(isCompleted)} />}
		</Box>
	);
}
