'use client';

import {
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	alpha,
	Fade,
} from '@mui/material';
import { X } from 'lucide-react';
import { palette } from '@/common/theme';
import { useModal } from './modal-context';

// ============================================================================
// Styles
// ============================================================================

const styles = {
	paper: {
		borderRadius: 4,
		background: alpha(palette.background.paper, 0.95),
		backdropFilter: 'blur(20px)',
		border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
		boxShadow: `0 25px 50px -12px ${alpha(palette.primary.main, 0.25)}`,
	},
	backdrop: {
		backgroundColor: alpha(palette.background.default, 0.85),
		backdropFilter: 'blur(4px)',
	},
	title: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottom: `1px solid ${alpha(palette.primary.light, 0.08)}`,
		py: { xs: 2, sm: 2.5 },
		px: { xs: 2.5, sm: 4 },
		background: `linear-gradient(to bottom, ${alpha(palette.primary.main, 0.03)}, transparent)`,
		'& .MuiTypography-root': {
			fontWeight: 700,
			fontSize: { xs: '1.1rem', sm: '1.25rem' },
			color: palette.text.primary,
			letterSpacing: '-0.01em',
		},
	},
	closeButton: {
		color: palette.text.secondary,
		background: alpha(palette.background.paper, 0.5),
		border: `1px solid ${alpha(palette.primary.light, 0.1)}`,
		'&:hover': {
			color: palette.text.primary,
			background: alpha(palette.primary.light, 0.1),
			transform: 'scale(1.05)',
		},
		transition: 'all 0.2s ease',
	},
	content: {
		p: { xs: 2.5, sm: 4 },
	},
};

// ============================================================================
// Component
// ============================================================================

export function Modal() {
	const { isOpen, content, options, closeModal } = useModal();

	const handleClose = (_event: object, reason: string) => {
		if (reason === 'backdropClick' && !options.closeOnOverlay) {
			return;
		}
		closeModal();
	};

	return (
		<Dialog
			open={isOpen}
			onClose={handleClose}
			maxWidth={options.maxWidth}
			fullWidth
			slots={{ transition: Fade }}
			slotProps={{
				backdrop: { sx: styles.backdrop },
				paper: { sx: styles.paper },
				transition: { timeout: 200 },
			}}>
			{(options.title || options.showCloseButton) && (
				<DialogTitle sx={styles.title}>
					{options.title || ''}
					{options.showCloseButton && (
						<IconButton
							onClick={closeModal}
							size='small'
							sx={styles.closeButton}
							aria-label='Close'>
							<X size={20} />
						</IconButton>
					)}
				</DialogTitle>
			)}

			<DialogContent sx={styles.content}>{content}</DialogContent>
		</Dialog>
	);
}
