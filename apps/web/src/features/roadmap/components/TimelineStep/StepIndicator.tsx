import { Box, Typography, useTheme, alpha } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { makeStyles } from './TimelineStep.styles';
import { palette } from '@/common/theme';

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
		<Box sx={{ ...styles.indicatorColumn, position: 'relative' }}>
			{/* Connector Line - Background */}
			{!isLast && (
				<Box
					sx={{
						position: 'absolute',
						top: 52,
						bottom: 0,
						left: '50%',
						width: 3,
						transform: 'translateX(-50%)',
						bgcolor: alpha(palette.divider, 0.08),
						borderRadius: 4,
						zIndex: 0,
					}}
				/>
			)}

			{/* Animated Progress Line */}
			{!isLast && isCompleted && (
				<motion.div
					initial={{ height: 0 }}
					animate={{ height: '100%' }}
					transition={{ duration: 0.8, ease: 'easeInOut' }}
					style={{
						position: 'absolute',
						top: 52,
						left: '50%',
						width: 3,
						background: `linear-gradient(to bottom, ${statusColor}, ${alpha(statusColor, 0.2)})`,
						transform: 'translateX(-50%)',
						borderRadius: 4,
						zIndex: 1,
						boxShadow: `0 0 8px ${alpha(statusColor, 0.3)}`,
					}}
				/>
			)}

			<Box sx={{ ...styles.dotContainer, zIndex: 2, position: 'relative' }}>
				{isActive && (
					<MotionBox
						animate={{
							scale: [1, 1.4, 1],
							opacity: [0.6, 0.1, 0.6],
							rotate: [0, 90, 180, 270, 360],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: 'linear',
						}}
						sx={{
							...styles.pulseRing,
							border: `2px dashed ${alpha(statusColor, 0.4)}`,
							borderRadius: '50%',
							bgcolor: 'transparent',
						}}
					/>
				)}

				<motion.div
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					style={{ cursor: 'pointer' }}>
					<Box
						sx={{
							...styles.dot(isCompleted),
							boxShadow:
								isCompleted ? `0 0 15px ${alpha(statusColor, 0.4)}` : 'none',
							border: `2px solid ${isCompleted ? statusColor : alpha(palette.divider, 0.2)}`,
							background:
								isCompleted ?
									`linear-gradient(135deg, ${statusColor}, ${palette.background.paper})`
								:	palette.background.paper,
							color:
								isCompleted ? palette.common.white : palette.text.secondary,
						}}>
						{isCompleted ?
							<CheckCircle2 size={20} fontWeight='bold' />
						:	<Typography
								variant='caption'
								sx={{ fontWeight: 800, fontSize: '0.8rem' }}>
								{order}
							</Typography>
						}
					</Box>
				</motion.div>
			</Box>
		</Box>
	);
}
