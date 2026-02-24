import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => ({
	container: (isPending: boolean) => ({
		display: 'flex',
		gap: 2.5,
		opacity: isPending ? 0.4 : 1,
		transition: 'opacity 0.4s ease',
	}),
	timelineColumn: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		pt: 0.5,
	},
	dotContainer: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	activePulse: (color: string) => ({
		position: 'absolute',
		width: 28,
		height: 28,
		borderRadius: '50%',
		bgcolor: alpha(color, 0.3),
	}),
	dot: (state: string, color: string) => ({
		width: 28,
		height: 28,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: state === 'completed' ? color : alpha(color, 0.15),
		color: state === 'completed' ? theme.palette.background.default : color,
		transition: 'all 0.4s ease',
	}),
	connectorLine: (isCompleted: boolean) => ({
		flex: 1,
		width: 2,
		minHeight: 32,
		mt: 1,
		bgcolor:
			isCompleted ?
				alpha(theme.palette.success.light, 0.3)
			:	alpha(theme.palette.divider, 1),
		transition: 'background-color 0.4s ease',
	}),
	labelColumn: (isLast: boolean) => ({
		pb: isLast ? 0 : 3,
	}),
	label: (color: string) => ({
		fontWeight: 600,
		color,
		transition: 'color 0.4s ease',
		mb: 0.25,
	}),
	description: {
		color: theme.palette.text.secondary,
	},
});
