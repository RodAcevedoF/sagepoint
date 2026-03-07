import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => ({
	container: {
		display: 'flex',
		gap: 0.75,
		mb: 3,
		flexWrap: 'wrap',
	},
	chip: (isSelected: boolean) => ({
		fontWeight: 500,
		bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
		color: isSelected ? theme.palette.primary.light : theme.palette.text.secondary,
		border: `1px solid ${alpha(
			isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
			isSelected ? 0.3 : 0.15,
		)}`,
		'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
	}),
});
