'use client';

import {
	Box,
	Typography,
	alpha,
	type Theme,
	type SxProps,
} from '@mui/material';
import { Shield, Users, Activity, Settings, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { palette } from '@/common/theme';

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
		border: `1px solid ${alpha(palette.info.light, 0.1)}`,
		boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
	},
	gradientOrb: {
		position: 'absolute',
		top: -120,
		right: -120,
		width: 400,
		height: 400,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(palette.info.main, 0.15)} 0%, transparent 70%)`,
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
		background: `radial-gradient(circle, ${alpha(palette.primary.main, 0.1)} 0%, transparent 70%)`,
		filter: 'blur(50px)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	title: {
		fontWeight: 900,
		mb: 2,
		background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.info.light} 50%, ${palette.primary.light} 100%)`,
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
		bgcolor: alpha(palette.info.main, 0.1),
		border: `1px solid ${alpha(palette.info.main, 0.2)}`,
		color: palette.info.light,
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
		right: '15%',
		color: palette.info.light as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	floatingIcon2: {
		position: 'absolute',
		bottom: '25%',
		right: '25%',
		color: palette.primary.light as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	floatingIcon3: {
		position: 'absolute',
		top: '25%',
		left: '8%',
		opacity: 0.1,
		color: palette.warning.main as string,
		pointerEvents: 'none',
	} as React.CSSProperties,
	actionContainer: {
		display: 'flex',
		gap: 2,
		position: 'relative',
		zIndex: 1,
	},
	activeMetric: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		color: palette.info.light,
		fontSize: '0.875rem',
		fontWeight: 600,
		bgcolor: alpha(palette.info.main, 0.12),
		px: 2,
		py: 1,
		borderRadius: 2,
		border: `1px solid ${alpha(palette.info.main, 0.2)}`,
	},
	systemStatus: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		color: palette.text.secondary,
		fontSize: '0.875rem',
		fontWeight: 500,
		bgcolor: alpha(palette.text.primary, 0.05),
		px: 2,
		py: 1,
		borderRadius: 2,
	},
});

const MotionBox = motion.create(Box);

export function AdminHero() {
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
					animate={{
						y: [0, -20, 0],
						rotate: [0, 15, 0],
						opacity: [0.1, 0.2, 0.1],
					}}
					transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
					style={styles.floatingIcon1 as React.CSSProperties}>
					<Shield size={64} />
				</motion.div>
				<motion.div
					animate={{ x: [0, 30, 0], opacity: [0.05, 0.15, 0.05] }}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 2,
					}}
					style={styles.floatingIcon2 as React.CSSProperties}>
					<Database size={48} />
				</motion.div>
				<motion.div
					animate={{ y: [0, 25, 0], scale: [1, 1.2, 1] }}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1,
					}}
					style={styles.floatingIcon3 as React.CSSProperties}>
					<Users size={36} />
				</motion.div>

				<Box sx={styles.badge}>
					<Shield size={14} />
					Command Center
				</Box>

				<Typography variant='h3' sx={styles.title}>
					System Management
				</Typography>

				<Typography variant='body1' sx={styles.subtitle}>
					Monitor platform health, manage your user base, and analyze content
					metrics. Access advanced controls to ensure a smooth learning
					experience for all users.
				</Typography>

				<Box sx={styles.actionContainer}>
					<Box sx={styles.activeMetric}>
						<Activity size={16} />
						Real-time metrics active
					</Box>
					<Box sx={styles.systemStatus}>
						<Settings size={16} />
						System Status: Online
					</Box>
				</Box>
			</Box>
		</MotionBox>
	);
}
