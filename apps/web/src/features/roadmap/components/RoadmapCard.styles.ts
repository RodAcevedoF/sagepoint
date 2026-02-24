import { Theme, alpha } from '@mui/material';

export const makeStyles = (statusColor: string, theme: Theme) => ({
	card: {
		cursor: 'pointer',
		transition:
			'transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.15s cubic-bezier(0.2, 0, 0, 1)',
		'&:hover': {
			transform: 'translateY(-3px)',
			boxShadow: `0 4px 20px ${alpha(statusColor, 0.1)}`,
		},
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: 2,
		mb: 2,
	},
	headerContent: {
		flex: 1,
		minWidth: 0,
	},
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		mb: 0.5,
	},
	title: {
		fontWeight: 600,
		color: theme.palette.text.primary,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	description: {
		color: theme.palette.text.secondary,
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	},
	progressContainer: {
		position: 'relative',
		flexShrink: 0,
		width: 52,
		height: 52,
	},
	progressTrack: {
		position: 'absolute',
		color: alpha(theme.palette.primary.main, 0.1),
	},
	progressValue: {
		position: 'absolute',
		color: statusColor,
	},
	progressCenter: {
		position: 'absolute',
		inset: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	progressText: {
		fontWeight: 700,
		color: statusColor,
		fontSize: '0.7rem',
	},
	statusBadge: {
		mb: 2,
	},
	statusChip: {
		height: 22,
		fontSize: '0.65rem',
		fontWeight: 600,
		bgcolor: alpha(statusColor, 0.12),
		color: statusColor,
	},
	statsRow: {
		display: 'flex',
		gap: 2,
		flexWrap: 'wrap',
		mb: 1.5,
	},
	statItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 0.5,
	},
	statText: {
		color: theme.palette.text.secondary,
	},
	difficultyRow: {
		display: 'flex',
		gap: 0.75,
		flexWrap: 'wrap',
	},
	difficultyChip: {
		height: 20,
		fontSize: '0.6rem',
	},
	footerContent: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	footerInfo: {
		display: 'flex',
		gap: 1.5,
		alignItems: 'center',
	},
	paceChip: {
		height: 20,
		fontSize: '0.6rem',
		bgcolor: alpha(theme.palette.info.main, 0.1),
		color: theme.palette.info.light,
	},
	relativeTime: {
		color: alpha(theme.palette.text.secondary, 0.6),
	},
});
