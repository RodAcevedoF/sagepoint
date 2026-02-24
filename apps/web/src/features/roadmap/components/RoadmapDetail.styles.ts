import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => ({
	container: {
		pb: 8,
	},
	headerCard: {
		mb: 5,
		p: { xs: 3, md: 4 },
		borderRadius: 6,
		position: 'relative',
		overflow: 'hidden',
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`,
	},
	accentBar: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light}, ${theme.palette.info.main})`,
	},
	headerContent: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: 3,
		alignItems: 'flex-start',
	},
	title: {
		fontWeight: 700,
		mb: 1,
		background: `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${theme.palette.primary.light} 100%)`,
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		fontSize: { xs: '1.75rem', sm: '2.25rem' },
		lineHeight: 1.2,
	},
	description: {
		color: theme.palette.text.secondary,
		mb: 3,
	},
	metaRow: {
		display: 'flex',
		gap: 3,
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	metaItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
	},
	metaValue: {
		color: theme.palette.text.primary,
		fontWeight: 600,
	},
	paceChip: {
		bgcolor: alpha(theme.palette.info.main, 0.1),
		color: theme.palette.info.light,
		'& .MuiChip-icon': { color: theme.palette.info.light },
	},
	progressCircleContainer: {
		position: 'relative',
		flexShrink: 0,
		width: 100,
		height: 100,
		display: { xs: 'none', sm: 'block' },
	},
	progressCircleBackground: {
		position: 'absolute',
		color: alpha(theme.palette.primary.main, 0.1),
	},
	progressCircleForeground: (percentage: number) => ({
		position: 'absolute',
		color:
			percentage === 100 ?
				theme.palette.success.light
			:	theme.palette.primary.light,
	}),
	progressLabelContainer: {
		position: 'absolute',
		inset: 0,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	progressPercentage: {
		fontWeight: 700,
		color: theme.palette.text.primary,
		lineHeight: 1,
	},
	progressLabel: {
		color: theme.palette.text.secondary,
		fontSize: '0.6rem',
	},
	timelineContainer: {
		display: 'flex',
		flexDirection: 'column',
	},
});
