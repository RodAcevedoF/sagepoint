'use client';

import {
	Box,
	Typography,
	alpha,
	type Theme,
	type SxProps,
} from '@mui/material';
import { Upload, FileText, Search, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
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
		border: `1px solid ${alpha(palette.secondary.light, 0.1)}`,
		boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
	},
	gradientOrb: {
		position: 'absolute',
		top: -120,
		left: -120,
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.secondary.main, 0.12)} 0%, transparent 70%)`,
		filter: 'blur(60px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	secondaryOrb: {
		position: 'absolute',
		bottom: -150,
		right: -100,
		width: 350,
		height: 350,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.info.main, 0.08)} 0%, transparent 70%)`,
		filter: 'blur(50px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	title: {
		fontWeight: 900,
		mb: 2,
		background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.secondary.light} 50%, ${palette.primary.main} 100%)`,
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
		bgcolor: alpha(palette.secondary.main, 0.1),
		border: `1px solid ${alpha(palette.secondary.main, 0.2)}`,
		color: palette.secondary.light,
		mb: 3,
		fontSize: '0.75rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '1px',
		position: 'relative',
		zIndex: 1,
	},
	floatingIcon1: {
		position: 'absolute',
		top: '15%',
		right: '12%',
		opacity: 0.15,
		color: palette.secondary.light as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	floatingIcon2: {
		position: 'absolute',
		bottom: '25%',
		right: '25%',
		opacity: 0.1,
		color: palette.info.light as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	floatingIcon3: {
		position: 'absolute',
		top: '20%',
		left: '8%',
		color: palette.warning.light as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	uploadButton: {
		py: 2,
		px: 4,
		borderRadius: 3,
		fontSize: '1rem',
		fontWeight: 700,
		height: 56,
		position: 'relative',
		zIndex: 1,
		boxShadow: `0 12px 24px ${alpha(palette.secondary.main, 0.2)}`,
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: `0 16px 32px ${alpha(palette.secondary.main, 0.3)}`,
		},
	},
});

interface DocumentHeroProps {
	onUpload: () => void;
}

export function DocumentHero({ onUpload }: DocumentHeroProps) {
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
					animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
					transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
					style={styles.floatingIcon1 as React.CSSProperties}>
					<FileText size={56} />
				</motion.div>
				<motion.div
					animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
					transition={{
						duration: 5,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 2,
					}}
					style={styles.floatingIcon2 as React.CSSProperties}>
					<Search size={40} />
				</motion.div>
				<motion.div
					animate={{ y: [0, 15, 0], opacity: [0.05, 0.15, 0.05] }}
					transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
					style={styles.floatingIcon3 as React.CSSProperties}>
					<ClipboardList size={32} />
				</motion.div>

				<Box sx={styles.badge}>
					<FileText size={14} />
					Deep Document analysis
				</Box>

				<Typography variant='h3' sx={styles.title}>
					Your Knowledge Base
				</Typography>

				<Typography variant='body1' sx={styles.subtitle}>
					Centralize your study materials. Our AI processes PDFs and files to
					extract key concepts, generate summaries, and prepare interactive
					evaluation quizzes.
				</Typography>

				<Button
					label='Upload Document'
					icon={Upload}
					iconPos={ButtonIconPositions.START}
					size={ButtonSizes.LARGE}
					onClick={onUpload}
					sx={styles.uploadButton}
				/>
			</Box>
		</MotionBox>
	);
}
