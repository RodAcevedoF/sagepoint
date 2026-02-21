'use client';

import { Box, Typography, alpha } from '@mui/material';
import { Shield, Activity } from 'lucide-react';
import { palette } from '@/common/theme';
import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

const styles = {
	footer: {
		mt: 12,
		pb: 6,
		borderTop: `1px solid ${alpha(palette.divider, 0.08)}`,
		display: 'flex',
		flexDirection: { xs: 'column', md: 'row' },
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 3,
		pt: 4,
	},
	statusGroup: {
		display: 'flex',
		alignItems: 'center',
		gap: 3,
		flexWrap: 'wrap',
	},
	statusItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		color: alpha(palette.text.secondary, 0.5),
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: '50%',
		bgcolor: palette.success.main,
		position: 'relative',
	},
	pulse: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: '50%',
		bgcolor: palette.success.main,
	} as CSSProperties,
	infoGroup: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: { xs: 'center', md: 'flex-end' },
	},
};

export function AdminFooter() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1, delay: 0.8 }}>
			<Box component='footer' sx={styles.footer}>
				<Box sx={styles.statusGroup}>
					<Box sx={styles.statusItem}>
						<Activity size={12} color={palette.text.secondary} />
						<Typography
							variant='caption'
							sx={{
								fontWeight: 800,
								letterSpacing: '0.8px',
								color: palette.text.secondary,
							}}>
							SYSTEM INTEGRITY:
						</Typography>
					</Box>

					<Box sx={styles.statusItem}>
						<Box sx={styles.statusDot}>
							<motion.div
								animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
								transition={{ duration: 2, repeat: Infinity }}
								style={styles.pulse}
							/>
						</Box>
						<Typography variant='caption'>Network</Typography>
					</Box>

					<Box sx={styles.statusItem}>
						<Box sx={styles.statusDot}>
							<motion.div
								animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
								transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
								style={styles.pulse}
							/>
						</Box>
						<Typography variant='caption'>GraphDB</Typography>
					</Box>

					<Box sx={styles.statusItem}>
						<Box sx={styles.statusDot}>
							<motion.div
								animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
								transition={{ duration: 2.4, repeat: Infinity, delay: 0.8 }}
								style={styles.pulse}
							/>
						</Box>
						<Typography variant='caption'>Compute</Typography>
					</Box>
				</Box>

				<Box sx={styles.infoGroup}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
						<Shield size={12} color={palette.info.main} />
						<Typography
							variant='caption'
							sx={{ fontWeight: 700, color: palette.text.secondary }}>
							Sagepoint Management Console
						</Typography>
					</Box>
					<Typography
						variant='caption'
						sx={{
							color: alpha(palette.text.secondary, 0.4),
							fontSize: '0.65rem',
						}}>
						v1.0.4-stable • Build 2D3F4 • Secure SSL Session
					</Typography>
				</Box>
			</Box>
		</motion.div>
	);
}
