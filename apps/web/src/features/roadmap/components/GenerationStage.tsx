'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { palette } from '@/common/theme';

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

const stateColors: Record<StageState, string> = {
	pending: palette.text.secondary,
	active: palette.primary.light,
	completed: palette.success.light,
};

export function GenerationStage({
	label,
	description,
	icon: Icon,
	state,
	isLast = false,
}: GenerationStageProps) {
	const color = stateColors[state];
	const isPending = state === 'pending';

	return (
		<Box
			sx={{
				display: 'flex',
				gap: 2.5,
				opacity: isPending ? 0.4 : 1,
				transition: 'opacity 0.4s ease',
			}}>
			{/* Timeline column */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					pt: 0.5,
				}}>
				{/* Dot */}
				<Box
					sx={{
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					{state === 'active' && (
						<MotionBox
							animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
							sx={{
								position: 'absolute',
								width: 28,
								height: 28,
								borderRadius: '50%',
								bgcolor: alpha(color, 0.3),
							}}
						/>
					)}
					<Box
						sx={{
							width: 28,
							height: 28,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: state === 'completed' ? color : alpha(color, 0.15),
							color: state === 'completed' ? palette.background.default : color,
							transition: 'all 0.4s ease',
						}}>
						{state === 'completed' ?
							<Check size={14} />
						:	<Icon size={14} />}
					</Box>
				</Box>

				{/* Connector line */}
				{!isLast && (
					<Box
						sx={{
							flex: 1,
							width: 2,
							minHeight: 32,
							mt: 1,
							bgcolor:
								state === 'completed' ?
									alpha(palette.success.light, 0.3)
								:	alpha(palette.divider, 1),
							transition: 'background-color 0.4s ease',
						}}
					/>
				)}
			</Box>

			{/* Label column */}
			<Box sx={{ pb: isLast ? 0 : 3 }}>
				<Typography
					variant='body1'
					sx={{
						fontWeight: 600,
						color,
						transition: 'color 0.4s ease',
						mb: 0.25,
					}}>
					{label}
				</Typography>
				<Typography variant='caption' sx={{ color: palette.text.secondary }}>
					{description}
				</Typography>
			</Box>
		</Box>
	);
}
