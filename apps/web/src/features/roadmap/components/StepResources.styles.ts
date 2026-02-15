import { type Theme, alpha, type SxProps } from '@mui/material';

export const makeStyles = (
	theme: Theme,
): {
	loadingContainer: SxProps<Theme>;
	emptyText: SxProps<Theme>;
	sectionTitle: SxProps<Theme>;
	resourcesList: SxProps<Theme>;
	resourceLink: SxProps<Theme>;
	iconContainer: (color: string) => SxProps<Theme>;
	resourceTitle: SxProps<Theme>;
	description: SxProps<Theme>;
	chipRow: SxProps<Theme>;
	providerChip: SxProps<Theme>;
	difficultyChip: (color: string) => SxProps<Theme>;
} => ({
	loadingContainer: {
		display: 'flex',
		justifyContent: 'center',
		py: 2,
	},
	emptyText: {
		color: theme.palette.text.secondary,
		fontStyle: 'italic',
		py: 1,
	},
	sectionTitle: {
		color: theme.palette.text.secondary,
		fontWeight: 600,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		mb: 1.5,
		display: 'block',
	},
	resourcesList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 1.5,
	},
	resourceLink: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		p: 1.5,
		borderRadius: 2.5,
		bgcolor: alpha(theme.palette.background.paper, 0.5),
		border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
		transition: 'all 0.2s ease',
		'&:hover': {
			bgcolor: alpha(theme.palette.primary.main, 0.06),
			borderColor: alpha(theme.palette.primary.main, 0.2),
			transform: 'translateX(4px)',
		},
	},
	iconContainer: (color: string) => ({
		width: 32,
		height: 32,
		borderRadius: 1.5,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(color, 0.1),
		color: color,
		flexShrink: 0,
	}),
	resourceTitle: {
		color: theme.palette.text.primary,
		fontWeight: 500,
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
	chipRow: {
		display: 'flex',
		gap: 1,
		mt: 0.5,
	},
	providerChip: {
		height: 20,
		fontSize: '0.65rem',
		bgcolor: alpha(theme.palette.text.secondary, 0.1),
		color: theme.palette.text.secondary,
	},
	difficultyChip: (color: string) => ({
		height: 20,
		fontSize: '0.65rem',
		bgcolor: alpha(color, 0.1),
		color: color,
	}),
});
