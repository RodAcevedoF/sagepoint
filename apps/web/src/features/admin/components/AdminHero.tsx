'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Shield, Users, Activity, Settings, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { makeStyles } from './AdminHero.styles';
import { palette } from '@/common/theme';

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
					style={{
						position: 'absolute',
						top: '15%',
						right: '15%',
						color: palette.info.light,
						pointerEvents: 'none',
					}}>
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
					style={{
						position: 'absolute',
						bottom: '25%',
						right: '25%',
						color: palette.primary.light,
						pointerEvents: 'none',
					}}>
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
					style={{
						position: 'absolute',
						top: '25%',
						left: '8%',
						opacity: 0.1,
						color: palette.warning.main,
						pointerEvents: 'none',
					}}>
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

				<Box sx={{ display: 'flex', gap: 2, position: 'relative', zIndex: 1 }}>
					<Box
						sx={{
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
						}}>
						<Activity size={16} />
						Real-time metrics active
					</Box>
					<Box
						sx={{
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
						}}>
						<Settings size={16} />
						System Status: Online
					</Box>
				</Box>
			</Box>
		</MotionBox>
	);
}
