'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';
import { makeStyles } from './RoadmapHero.styles';

const MotionBox = motion.create(Box);

export function RoadmapHero() {
	const theme = useTheme();
	const router = useRouter();
	const styles = makeStyles(theme);

	return (
		<MotionBox
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			sx={styles.container}>
			<Box sx={styles.content}>
				{/* Decorative gradient orb */}
				<Box sx={styles.gradientOrb} />

				<Typography variant='h3' sx={styles.title}>
					Your Learning Journey
				</Typography>

				<Typography variant='body1' sx={styles.subtitle}>
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
