import { type Theme, alpha } from '@mui/material';

export const makeStyles = (isFailed: boolean, theme: Theme) => {
	const accentColor = isFailed ? theme.palette.error.main : theme.palette.primary.main;
	const chipColor = isFailed ? theme.palette.error.main : theme.palette.info.main;

	return {
		container: {
			p: 3,
			borderRadius: 3,
			border: `1px solid ${alpha(accentColor, 0.2)}`,
			background: alpha(accentColor, 0.04),
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: 1.5,
			textAlign: 'center',
		},
		title: {
			fontWeight: 600,
		},
		chip: {
			bgcolor: alpha(chipColor, 0.1),
			color: chipColor,
			fontWeight: 600,
		},
	};
};
