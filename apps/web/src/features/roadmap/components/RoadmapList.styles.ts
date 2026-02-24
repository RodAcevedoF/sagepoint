import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => ({
	emptyStateContainer: {
		position: 'relative',
		py: 8,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		border: `2px dashed ${alpha(theme.palette.primary.light, 0.15)}`,
		borderRadius: 6,
		overflow: 'hidden',
	},
	emptyStateTitle: {
		fontWeight: 600,
		color: theme.palette.text.primary,
		mb: 1,
	},
	emptyStateSubtitle: {
		color: theme.palette.text.secondary,
		mb: 3,
		textAlign: 'center',
		maxWidth: 360,
		px: 2,
	},
	floatingIcon: {
		position: 'absolute',
	},
});
