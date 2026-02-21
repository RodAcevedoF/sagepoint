'use client';

import {
	alpha,
	Box,
	Typography,
	type Theme,
	type SxProps,
} from '@mui/material';
import { Sparkles, Route, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonIconPositions, ButtonSizes } from '@/common/types';
import { palette } from '@/common/theme';

const MotionBox = motion.create(Box);

const makeStyles = (): Record<string, SxProps<Theme>> => ({
	container: {
		mb: 6,
		position: 'relative',
	},
	content: {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: 8,
		p: { xs: 5, md: 8 },
		background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
		backdropFilter: 'blur(16px)',
		border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
		boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
	},
	gradientOrb: {
		position: 'absolute',
		top: -120,
		right: -120,
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.15)} 0%, transparent 70%)`,
		filter: 'blur(60px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	secondaryOrb: {
		position: 'absolute',
		bottom: -150,
		left: -100,
		width: 350,
		height: 350,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.info.main, 0.1)} 0%, transparent 70%)`,
		filter: 'blur(50px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	title: {
		fontWeight: 900,
		mb: 2,
		background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.primary.light} 50%, ${palette.info.light} 100%)`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		fontSize: { xs: '2.5rem', md: '3.5rem' },
		letterSpacing: '-1.5px',
		lineHeight: 1.1,
		position: 'relative',
		zIndex: 1,
	},
	subtitle: {
		color: palette.text.secondary,
		mb: 4,
		maxWidth: 540,
		fontSize: '1.1rem',
		lineHeight: 1.6,
		position: 'relative',
		zIndex: 1,
		opacity: 0.9,
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 1,
		px: 2,
		py: 0.5,
		borderRadius: 100,
		bgcolor: alpha(palette.primary.main, 0.1),
		border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
		color: palette.primary.light,
		mb: 3,
		fontSize: '0.75rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '1px',
		position: 'relative',
		zIndex: 1,
	},
});

export function RoadmapHero() {
	const router = useRouter();
	const styles = makeStyles();

	return (
		<MotionBox
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: 'easeOut' }}
			sx={styles.container}>
			<Box sx={styles.content}>
				{/* Decorative orbs */}
				<Box sx={styles.gradientOrb} />
				<Box sx={styles.secondaryOrb} />

				{/* Floating Icons */}
				<motion.div
					animate={{ y: [0, -15, 0], opacity: [0.1, 0.2, 0.1] }}
					transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
					style={{
						position: 'absolute',
						top: '15%',
						right: '15%',
						color: palette.primary.light,
						pointerEvents: 'none',
					}}>
					<Route size={48} />
				</motion.div>
				<motion.div
					animate={{ y: [0, 20, 0], opacity: [0.05, 0.15, 0.05] }}
					transition={{
						duration: 5,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					style={{
						position: 'absolute',
						bottom: '20%',
						left: '10%',
						color: palette.info.light,
						pointerEvents: 'none',
					}}>
					<Map size={40} />
				</motion.div>

				<Box sx={styles.badge}>
					<Sparkles size={14} />
					AI Personalized paths
				</Box>

				<Typography variant='h3' sx={styles.title}>
					Your Learning Journey
				</Typography>

				<Typography variant='body1' sx={styles.subtitle}>
					Master any skill through structured, data-driven roadmaps. From
					fundamental concepts to advanced mastery, Sagepoint guides every step
					of the way.
				</Typography>

				<Button
					label='Create New Roadmap'
					icon={Sparkles}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.LARGE}
					onClick={() => router.push('/roadmaps/create')}
					sx={{
						py: 2,
						px: 4,
						borderRadius: 3,
						fontSize: '1rem',
						fontWeight: 700,
						height: 56,
						position: 'relative',
						zIndex: 1,
						boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.2)}`,
						'&:hover': {
							transform: 'translateY(-2px)',
							boxShadow: `0 16px 32px ${alpha(palette.primary.main, 0.3)}`,
						},
					}}
				/>
			</Box>
		</MotionBox>
	);
}
