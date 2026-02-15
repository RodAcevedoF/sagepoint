import { alpha, type SxProps } from '@mui/material';
import type { Theme } from '@mui/material';

export const makeStyles = (
	theme: Theme,
	statusColor: string,
): {
	container: SxProps<Theme>;
	indicatorColumn: SxProps<Theme>;
	dotContainer: SxProps<Theme>;
	pulseRing: SxProps<Theme>;
	dot: (isCompleted: boolean) => SxProps<Theme>;
	connector: (isCompleted: boolean) => SxProps<Theme>;
	card: SxProps<Theme>;
	header: SxProps<Theme>;
	titleRow: SxProps<Theme>;
	title: SxProps<Theme>;
	stepChip: SxProps<Theme>;
	description: (expanded: boolean) => SxProps<Theme>;
	metaRow: SxProps<Theme>;
	statusChip: (color: string) => SxProps<Theme>;
	actionsContainer: SxProps<Theme>;
	actionButton: SxProps<Theme>;
	skipButton: SxProps<Theme>;
	expandedContent: SxProps<Theme>;
	infoBox: (color: string) => SxProps<Theme>;
	infoLabel: (color: string) => SxProps<Theme>;
} => ({
	container: {
		display: 'flex',
		gap: 2.5,
	},
	indicatorColumn: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		pt: 2.5,
	},
	dotContainer: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	pulseRing: {
		position: 'absolute',
		width: 40,
		height: 40,
		borderRadius: '50%',
		bgcolor: alpha(statusColor, 0.3),
	},
	dot: (isCompleted: boolean) => ({
		width: 40,
		height: 40,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: isCompleted ? statusColor : alpha(statusColor, 0.15),
		color: isCompleted ? theme.palette.background.default : statusColor,
		transition: 'all 0.3s ease',
		zIndex: 1,
	}),
	connector: (isCompleted: boolean) => ({
		flex: 1,
		width: 2,
		mt: 1,
		bgcolor:
			isCompleted ?
				alpha(theme.palette.success.light, 0.3)
			:	alpha(theme.palette.divider, 1),
		transition: 'background-color 0.3s ease',
	}),
	card: {
		flex: 1,
		borderRadius: 4,
		overflow: 'hidden',
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
		transition: 'all 0.3s ease',
		'&:hover': {
			borderColor: alpha(theme.palette.primary.light, 0.25),
		},
	},
	header: {
		p: 2.5,
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 2,
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		mb: 1,
		flexWrap: 'wrap',
	},
	title: {
		fontWeight: 600,
		color: theme.palette.text.primary,
	},
	stepChip: {
		height: 22,
		fontSize: '0.65rem',
		bgcolor: alpha(theme.palette.primary.main, 0.1),
		color: theme.palette.primary.light,
	},
	description: (expanded: boolean) => ({
		color: theme.palette.text.secondary,
		mb: 1,
		display: '-webkit-box',
		WebkitLineClamp: expanded ? 999 : 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	}),
	metaRow: {
		display: 'flex',
		gap: 1.5,
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	statusChip: (color: string) => ({
		height: 22,
		fontSize: '0.65rem',
		fontWeight: 600,
		bgcolor: alpha(color, 0.12),
		color: color,
	}),
	actionsContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: 0.5,
		flexShrink: 0,
	},
	actionButton: {
		color: theme.palette.primary.light,
		'&:hover': {
			bgcolor: alpha(theme.palette.primary.main, 0.1),
		},
	},
	skipButton: {
		color: theme.palette.text.secondary,
		'&:hover': {
			bgcolor: alpha(theme.palette.text.secondary, 0.1),
		},
	},
	expandedContent: {
		px: 2.5,
		pb: 2.5,
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
	},
	infoBox: (color: string) => ({
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		p: 2,
		borderRadius: 3,
		bgcolor: alpha(color, 0.06),
		border: `1px solid ${alpha(color, 0.12)}`,
	}),
	infoLabel: (color: string) => ({
		fontWeight: 600,
		color: color,
		display: 'block',
		mb: 0.5,
	}),
});
