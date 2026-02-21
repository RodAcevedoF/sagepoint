import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
	interface Palette {
		accent: string;
	}
	interface PaletteOptions {
		accent?: string;
	}
}

export const palette = {
	primary: {
		main: '#35A29F',
		light: '#97FEED',
		dark: '#0B666A',
	},
	secondary: {
		main: '#0B666A',
		light: '#35A29F',
		dark: '#071952',
	},
	background: {
		default: '#030712',
		paper: '#0a0f1a',
		gradient:
			'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #030712 60%, #071952 100%)',
	},
	text: {
		primary: '#f5f5f5',
		secondary: 'rgba(151, 254, 237, 0.7)',
	},
	warning: {
		main: '#f59e0b',
		light: '#fbbf24',
		dark: '#d97706',
	},
	error: {
		main: '#ef4444',
		light: '#f87171',
		dark: '#dc2626',
	},
	success: {
		main: '#10b981',
		light: '#34d399',
		dark: '#059669',
	},
	info: {
		main: '#3b82f6',
		light: '#60a5fa',
		dark: '#2563eb',
	},
	accent: '#97FEED',
	divider: 'rgba(151, 254, 237, 0.08)',
	common: {
		white: '#ffffff',
		black: '#000000',
	},
};

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: palette.primary,
		secondary: palette.secondary,
		background: {
			default: palette.background.default,
			paper: palette.background.paper,
		},
		text: palette.text,
		divider: palette.divider,
		warning: palette.warning,
		error: palette.error,
		success: palette.success,
		info: palette.info,
		accent: palette.accent,
		common: palette.common,
	},
	typography: {
		fontFamily: 'var(--font-geist-sans), "Inter", "Roboto", sans-serif',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: '8px',
					fontWeight: 500,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
				},
			},
		},
	},
});
