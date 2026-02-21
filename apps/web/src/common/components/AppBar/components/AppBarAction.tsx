'use client';
import { type ComponentType } from 'react';
import {
	Box,
	alpha,
	useMediaQuery,
	useTheme,
	type SxProps,
	type Theme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { palette } from '@/common/theme';

// ============================================================================
// Types & Styles
// ============================================================================

export interface AppBarActionProps {
	icon: ComponentType<{ size?: number; strokeWidth?: number }>;
	label: string;
	onClick?: () => void;
	variant?: 'default' | 'primary' | 'glow';
}

const makeStyles = (
	size: number,
	variant: string,
): Record<string, SxProps<Theme>> => ({
	container: {
		position: 'relative',
		mx: { xs: 0.5, sm: 1 },
	},
	pulseRing: {
		position: 'absolute',
		inset: -3,
		borderRadius: '50%',
		border: `2px solid ${alpha(palette.primary.light, 0.25)}`,
		animation: 'appbar-pulse 2.5s ease-in-out infinite',
		'@keyframes appbar-pulse': {
			'0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
			'50%': { transform: 'scale(1.12)', opacity: 0 },
		},
	},
	button: {
		position: 'relative' as const,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: size,
		height: size,
		border: 'none',
		borderRadius: '50%',
		cursor: 'pointer',
		outline: 'none',
		color: variant === 'default' ? palette.text.primary : '#fff',
		background:
			variant === 'default' ?
				alpha(palette.background.paper, 0.9)
			:	`linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 50%, ${palette.primary.dark} 100%)`,
		boxShadow:
			variant === 'glow' ?
				`0 8px 24px ${alpha(palette.primary.main, 0.4)}, 0 0 40px ${alpha(
					palette.primary.light,
					0.2,
				)}, inset 0 1px 1px ${alpha('#fff', 0.3)}`
			: variant === 'primary' ?
				`0 6px 16px ${alpha(palette.primary.main, 0.35)}`
			:	`0 2px 8px ${alpha('#000', 0.1)}`,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	},
});

// ============================================================================
// Component
// ============================================================================

export function AppBarAction({
	icon: Icon,
	label,
	onClick,
	variant = 'primary',
}: AppBarActionProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const size = isMobile ? 44 : 50;
	const styles = makeStyles(size, variant);

	return (
		<Box sx={styles.container}>
			{/* Pulse ring for glow variant */}
			{variant === 'glow' && <Box sx={styles.pulseRing} />}
			<motion.button
				whileHover={{ scale: 1.08, y: -2 }}
				whileTap={{ scale: 0.95 }}
				onClick={onClick}
				aria-label={label}
				style={styles.button as React.CSSProperties}>
				<Icon size={isMobile ? 20 : 22} strokeWidth={2.5} />
			</motion.button>
		</Box>
	);
}
