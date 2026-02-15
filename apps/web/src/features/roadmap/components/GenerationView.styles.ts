import { type Theme, alpha, type SxProps } from '@mui/material';

export const makeStyles = (theme: Theme): Record<string, SxProps<Theme>> => ({
	inputCard: {
		position: 'relative',
		overflow: 'hidden',
		p: { xs: 4, md: 5 },
		borderRadius: 6,
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
	},
	iconCenter: {
		display: 'flex',
		justifyContent: 'center',
		mb: 3,
	},
	iconWrapper: {
		width: 64,
		height: 64,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(theme.palette.primary.main, 0.12),
		color: theme.palette.primary.light,
	},
	title: {
		fontWeight: 700,
		textAlign: 'center',
		mb: 1,
		background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.accent})`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
	},
	subtitle: {
		color: theme.palette.text.secondary,
		textAlign: 'center',
		mb: 4,
	},
	textField: {
		mb: 2,
	},
	nameField: {
		mb: 3,
	},
	errorText: {
		color: theme.palette.error.light,
		mb: 2,
		textAlign: 'center',
	},
	generatingCard: {
		p: { xs: 4, md: 5 },
		borderRadius: 6,
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
	},
	generatingTitle: {
		fontWeight: 700,
		mb: 1,
		background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.accent})`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
	},
	generatingSubtitle: {
		color: theme.palette.text.secondary,
		mb: 4,
	},
	stagesWrapper: {
		pl: 1,
	},
});
