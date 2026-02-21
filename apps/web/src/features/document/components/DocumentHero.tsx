'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';

const MotionBox = motion.create(Box);

interface DocumentHeroProps {
	onUpload: () => void;
}

export function DocumentHero({ onUpload }: DocumentHeroProps) {
	const theme = useTheme();

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			sx={{ mb: 5 }}>
			<Box
				sx={{
					position: 'relative',
					overflow: 'hidden',
					borderRadius: 6,
					p: { xs: 4, md: 6 },
					background: alpha(theme.palette.background.paper, 0.4),
					backdropFilter: 'blur(12px)',
					border: `1px solid ${alpha(theme.palette.secondary.light, 0.1)}`,
				}}>
				<Box
					sx={{
						position: 'absolute',
						top: -80,
						right: -80,
						width: 260,
						height: 260,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
						pointerEvents: 'none',
					}}
				/>

				<Typography
					variant='h3'
					sx={{
						fontWeight: 800,
						mb: 1.5,
						background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.light} 100%)`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}>
					Your Documents
				</Typography>

				<Typography
					variant='body1'
					sx={{
						color: theme.palette.text.secondary,
						mb: 3,
						maxWidth: 480,
					}}>
					Upload documents and let AI analyze them — get summaries, concept maps, and interactive quizzes.
				</Typography>

				<Button
					label='Upload Document'
					icon={Upload}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.LARGE}
					onClick={onUpload}
				/>
			</Box>
		</MotionBox>
	);
}
