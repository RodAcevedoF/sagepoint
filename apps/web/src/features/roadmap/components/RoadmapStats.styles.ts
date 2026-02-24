import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => {
	return {
		container: {
			display: 'grid',
			gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
			gap: 2.5,
			mb: 5,
		},
		card: (color: string) => ({
			p: 3,
			borderRadius: 4,
			background: alpha(theme.palette.background.paper, 0.4),
			backdropFilter: 'blur(12px)',
			border: `1px solid ${alpha(color, 0.15)}`,
		}),
		iconContainer: (color: string) => ({
			width: 40,
			height: 40,
			borderRadius: 2.5,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			bgcolor: alpha(color, 0.12),
			color,
			mb: 1.5,
		}),
		value: (color: string) => ({
			fontWeight: 700,
			color,
			mb: 0.25,
		}),
		label: {
			color: theme.palette.text.secondary,
		},
	};
};
