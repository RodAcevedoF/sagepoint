'use client';

import { Box, Typography, Stack, alpha } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Plus, Map, FileUp, ArrowUpRight } from 'lucide-react';
import { useModal, SectionTitle } from '@/common/components';
import { UploadDocumentModal } from '@/features/document';
import { palette } from '@/common/theme';

// ============================================================================
// Styles
// ============================================================================

const styles = {
	card: {
		p: 0,
		background: 'transparent',
		border: 'none',
		backdropFilter: 'none',
		overflow: 'visible',
	},
	title: {
		fontWeight: 700,
		mb: 3,
		letterSpacing: '-0.02em',
	},
	action: {
		p: 3,
		borderRadius: 5,
		bgcolor: alpha(palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		cursor: 'pointer',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: 2,
		flex: 1,
		position: 'relative',
		overflow: 'hidden',
		'&:hover': {
			transform: 'translateY(-4px)',
			bgcolor: alpha(palette.background.paper, 0.6),
			boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.1)}`,
			'& .action-icon': {
				transform: 'scale(1.1) rotate(-5deg)',
			},
			'& .action-arrow': {
				transform: 'translateX(4px)',
				opacity: 1,
			},
		},
	},
	createAction: {
		borderColor: alpha(palette.primary.light, 0.15),
		'&:hover': {
			borderColor: alpha(palette.primary.light, 0.4),
			boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.15)}`,
			'& .action-icon': {
				bgcolor: alpha(palette.primary.main, 0.25),
			},
		},
	},
	libraryAction: {
		borderColor: alpha(palette.warning.light, 0.15),
		'&:hover': {
			borderColor: alpha(palette.warning.light, 0.4),
			boxShadow: `0 12px 24px ${alpha(palette.warning.main, 0.15)}`,
			'& .action-icon': {
				bgcolor: alpha(palette.warning.main, 0.25),
			},
		},
		'& .action-arrow': {
			color: palette.warning.light,
		},
	},
	uploadAction: {
		borderColor: alpha(palette.info.light, 0.15),
		'&:hover': {
			borderColor: alpha(palette.info.light, 0.4),
			boxShadow: `0 12px 24px ${alpha(palette.info.main, 0.15)}`,
			'& .action-icon': {
				bgcolor: alpha(palette.info.main, 0.25),
			},
		},
		'& .action-arrow': {
			color: palette.info.light,
		},
	},
	actionIcon: {
		width: 48,
		height: 48,
		borderRadius: 3,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(palette.primary.main, 0.15),
		color: palette.primary.light,
		flexShrink: 0,
		transition: 'all 0.3s ease',
	},
	libraryActionIcon: {
		width: 48,
		height: 48,
		borderRadius: 3,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(palette.warning.main, 0.15),
		color: palette.warning.light,
		flexShrink: 0,
		transition: 'all 0.3s ease',
	},
	uploadActionIcon: {
		width: 48,
		height: 48,
		borderRadius: 3,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(palette.info.main, 0.15),
		color: palette.info.light,
		flexShrink: 0,
		transition: 'all 0.3s ease',
	},
	arrow: {
		position: 'absolute',
		right: 24,
		top: 24,
		opacity: 0.3,
		transition: 'all 0.3s ease',
		color: palette.primary.light,
	},
};

// ============================================================================
// Component
// ============================================================================

export function DashboardQuickActions() {
	const router = useRouter();
	const { openModal } = useModal();

	const handleUpload = () => {
		openModal(<UploadDocumentModal />, {
			title: 'Upload Document',
			showCloseButton: true,
			maxWidth: 'sm',
		});
	};

	return (
		<Box sx={styles.card}>
			<SectionTitle subtitle='Jump back in or start something new with AI.'>
				Quick Actions
			</SectionTitle>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
				<Box
					sx={[styles.action, styles.createAction]}
					onClick={() => router.push('/roadmaps/create')}>
					<Box className='action-icon' sx={styles.actionIcon}>
						<Plus size={24} />
					</Box>
					<Box className='action-arrow' sx={styles.arrow}>
						<ArrowUpRight size={20} />
					</Box>
					<Box>
						<Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
							Create Roadmap
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ opacity: 0.8, lineHeight: 1.5 }}>
							Generate a personalized learning path from any topic using AI
						</Typography>
					</Box>
				</Box>

				<Box
					sx={[styles.action, styles.libraryAction]}
					onClick={() => router.push('/roadmaps')}>
					<Box className='action-icon' sx={styles.libraryActionIcon}>
						<Map size={24} />
					</Box>
					<Box className='action-arrow' sx={styles.arrow}>
						<ArrowUpRight size={20} />
					</Box>
					<Box>
						<Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
							View Library
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ opacity: 0.8, lineHeight: 1.5 }}>
							Access all your generated roadmaps and continue your progress
						</Typography>
					</Box>
				</Box>

				<Box sx={[styles.action, styles.uploadAction]} onClick={handleUpload}>
					<Box className='action-icon' sx={styles.uploadActionIcon}>
						<FileUp size={24} />
					</Box>
					<Box className='action-arrow' sx={styles.arrow}>
						<ArrowUpRight size={20} />
					</Box>
					<Box>
						<Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
							Analyze Document
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'
							sx={{ opacity: 0.8, lineHeight: 1.5 }}>
							Upload files to extract concepts and generate targeted roadmaps
						</Typography>
					</Box>
				</Box>
			</Stack>
		</Box>
	);
}
