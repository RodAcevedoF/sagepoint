import { type Theme, type SxProps, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => ({
	infoCallout: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 2,
		p: 2,
		mb: 3,
		borderRadius: 2.5,
		bgcolor: alpha(theme.palette.info.main, 0.06),
		border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
	},
	infoCalloutText: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
	},
	progressChip: {
		fontWeight: 700,
		fontSize: '0.75rem',
		bgcolor: alpha(theme.palette.primary.main, 0.15),
		color: theme.palette.primary.light,
		flexShrink: 0,
	},
	questionWrapper: {
		mb: 2.5,
		p: 2.5,
		borderRadius: 3,
		bgcolor: alpha(theme.palette.background.paper, 0.35),
		border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
	},
	questionHeader: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		mb: 2,
	},
	questionBadge: {
		minWidth: 28,
		height: 28,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(theme.palette.primary.main, 0.12),
		color: theme.palette.primary.light,
		fontWeight: 700,
		fontSize: '0.8rem',
		flexShrink: 0,
	},
	resultsBanner: (passed: boolean): SxProps<Theme> => ({
		textAlign: 'center',
		p: 3,
		mb: 3,
		borderRadius: 3,
		bgcolor: alpha(
			passed ? theme.palette.success.main : theme.palette.error.main,
			0.1,
		),
		border: `1px solid ${alpha(passed ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
	}),
	resultScore: {
		fontWeight: 900,
		fontSize: '2.5rem',
		lineHeight: 1,
		mt: 1.5,
		mb: 0.5,
	},
	resultSubtext: {
		color: theme.palette.text.secondary,
	},
	resultPassedNote: {
		color: theme.palette.success.light,
		mt: 0.5,
		fontWeight: 500,
	},
	questionCard: (isCorrect: boolean): SxProps<Theme> => ({
		mb: 2,
		p: 2,
		borderRadius: 2,
		bgcolor: alpha(theme.palette.background.paper, 0.5),
		border: `1px solid ${alpha(isCorrect ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
	}),
	optionCard: (
		isSelected: boolean,
		isCorrect?: boolean,
		isWrong?: boolean,
	): SxProps<Theme> => {
		let borderColor = alpha(theme.palette.divider, 0.2);
		let bgColor = alpha(theme.palette.background.paper, 0.3);

		if (isCorrect) {
			borderColor = alpha(theme.palette.success.main, 0.4);
			bgColor = alpha(theme.palette.success.main, 0.06);
		} else if (isWrong) {
			borderColor = alpha(theme.palette.error.main, 0.4);
			bgColor = alpha(theme.palette.error.main, 0.06);
		} else if (isSelected) {
			borderColor = alpha(theme.palette.primary.main, 0.5);
			bgColor = alpha(theme.palette.primary.main, 0.1);
		}

		return {
			p: 1.5,
			borderRadius: 2,
			cursor: isCorrect || isWrong ? 'default' : 'pointer',
			display: 'flex',
			alignItems: 'center',
			gap: 1.5,
			border: `1px solid ${borderColor}`,
			bgcolor: bgColor,
			transition: 'all 0.15s ease',
			'&:hover':
				isCorrect || isWrong ?
					{}
				:	{
						bgcolor: alpha(theme.palette.primary.main, 0.08),
						borderColor: alpha(theme.palette.primary.main, 0.3),
					},
		};
	},
	explanationBox: {
		display: 'flex',
		gap: 1,
		p: 1.5,
		borderRadius: 1.5,
		bgcolor: alpha(theme.palette.info.main, 0.06),
		border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
	},
	optionChip: (
		isSelected: boolean,
		isCorrect?: boolean,
		isWrong?: boolean,
	) => ({
		minWidth: 28,
		height: 24,
		fontWeight: 700,
		fontSize: '0.7rem',
		bgcolor:
			isCorrect ? alpha(theme.palette.success.main, 0.2)
			: isWrong ? alpha(theme.palette.error.main, 0.2)
			: isSelected ? alpha(theme.palette.primary.main, 0.2)
			: alpha(theme.palette.text.secondary, 0.1),
		color:
			isCorrect ? theme.palette.success.light
			: isWrong ? theme.palette.error.light
			: isSelected ? theme.palette.primary.light
			: theme.palette.text.secondary,
	}),
});

export type Styles = ReturnType<typeof makeStyles>;
