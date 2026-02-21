import { type Theme, type SxProps, alpha } from '@mui/material';

export const makeStyles = (
	stageColor: string,
	theme: Theme,
): Record<string, SxProps<Theme>> => ({
	card: {
		cursor: 'pointer',
		transition: 'transform 0.2s, box-shadow 0.2s',
		'&:hover': {
			transform: 'translateY(-3px)',
			boxShadow: `0 4px 20px ${alpha(stageColor, 0.1)}`,
		},
	},
	header: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 2,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(stageColor, 0.12),
		color: stageColor,
		flexShrink: 0,
	},
	titleContainer: {
		flex: 1,
		minWidth: 0,
	},
	title: {
		fontWeight: 600,
		color: theme.palette.text.primary,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	statsRow: {
		display: 'flex',
		gap: 2,
		flexWrap: 'wrap',
		mt: 1.5,
	},
	statItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 0.5,
	},
	statText: {
		color: theme.palette.text.secondary,
	},
	footer: {
		pt: 0,
	},
	footerContent: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	deleteButton: {
		position: 'absolute',
		top: 12,
		right: 12,
		color: theme.palette.text.secondary,
		opacity: 0.6,
		transition: 'opacity 0.2s, color 0.2s',
		'&:hover': {
			color: theme.palette.error.main,
			opacity: 1,
		},
	},
});
