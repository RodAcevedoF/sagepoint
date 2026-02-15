import { type Theme, alpha, type SxProps } from '@mui/material';

export const makeStyles = (theme: Theme): Record<string, SxProps<Theme>> => ({
	container: {
		mb: 5,
	},
	content: {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: 6,
		p: { xs: 4, md: 6 },
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
	},
	gradientOrb: {
		position: 'absolute',
		top: -80,
		right: -80,
		width: 260,
		height: 260,
		borderRadius: '50%',
		background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
		pointerEvents: 'none',
	},
	title: {
		fontWeight: 800,
		mb: 1.5,
		background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.light} 100%)`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
	},
	subtitle: {
		color: theme.palette.text.secondary,
		mb: 3,
		maxWidth: 480,
	},
});
