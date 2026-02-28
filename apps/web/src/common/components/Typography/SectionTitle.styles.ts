import { type Theme, alpha } from '@mui/material';

export const makeStyles = (theme: Theme) => {
	return {
		container: {
			mb: 4,
		},
		header: {
			display: 'flex',
			alignItems: 'center',
			gap: 1.5,
			mb: 0.5,
		},
		bar: (variant: string) => ({
			width: 4,
			height:
				variant === 'h3' ? 32
				: variant === 'h4' ? 24
				: 20,
			borderRadius: 1,
			bgcolor: theme.palette.primary.main,
			boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}`,
		}),
		title: (gradient: boolean) => ({
			fontWeight: 800,
			letterSpacing: '-0.03em',
			textTransform: 'tight',
			...(gradient && {
				background: `linear-gradient(135deg, ${
					theme.palette.common.white
				} 0%, ${alpha(theme.palette.primary.light, 0.8)} 100%)`,
				WebkitBackgroundClip: 'text',
				WebkitTextFillColor: 'transparent',
			}),
		}),
		subtitleContainer: (showBar: boolean) => ({
			ml: showBar ? 2 : 0,
		}),
		subtitleText: {
			color: 'text.secondary',
			opacity: 0.7,
			maxWidth: 600,
			lineHeight: 1.6,
		},
	};
};
