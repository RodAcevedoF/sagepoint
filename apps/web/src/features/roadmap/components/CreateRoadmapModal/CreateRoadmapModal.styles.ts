import { type Theme, alpha, type SxProps } from '@mui/material';

export const makeStyles = (theme: Theme): Record<string, SxProps<Theme>> => ({
	container: {
		py: 1,
	},
	description: {
		color: theme.palette.text.secondary,
		mb: 3,
	},
	field: {
		mb: 2,
	},
	nameField: {
		mb: 3,
	},
	errorText: {
		color: theme.palette.error.light,
		mb: 2,
	},
	loadingContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: 2,
		mb: 3,
		p: 2,
		borderRadius: 2,
		bgcolor: alpha(theme.palette.primary.main, 0.08),
		border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
	},
	loadingProgress: {
		color: theme.palette.primary.light,
	},
	loadingText: {
		color: theme.palette.text.secondary,
	},
	submitButton: {
		py: 1.5,
	},
});
