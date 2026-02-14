'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';
import { palette } from '@/common/theme';

const MotionBox = motion.create(Box);

export function RoadmapHero() {
	const router = useRouter();

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
					background: alpha(palette.background.paper, 0.4),
					backdropFilter: 'blur(12px)',
					border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
				}}>
				{/* Decorative gradient orb */}
				<Box
					sx={{
						position: 'absolute',
						top: -80,
						right: -80,
						width: 260,
						height: 260,
						borderRadius: '50%',
						background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.2)} 0%, transparent 70%)`,
						pointerEvents: 'none',
					}}
				/>

				<Typography
					variant='h3'
					sx={{
						fontWeight: 800,
						mb: 1.5,
						background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.accent} 50%, ${palette.info.light} 100%)`,
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}>
					Your Learning Journey
				</Typography>

				<Typography
					variant='body1'
					sx={{ color: palette.text.secondary, mb: 3, maxWidth: 480 }}>
					Track progress, explore new topics, and master skills with AI-powered
					roadmaps tailored to your goals.
				</Typography>

				<Button
					label='Create New Roadmap'
					icon={Sparkles}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.LARGE}
					onClick={() => router.push('/roadmaps/create')}
				/>
			</Box>
		</MotionBox>
	);
}
