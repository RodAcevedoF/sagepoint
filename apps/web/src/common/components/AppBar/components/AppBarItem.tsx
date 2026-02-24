import { type ComponentType, type CSSProperties, useMemo } from 'react';
import {
	Box,
	alpha,
	useMediaQuery,
	useTheme,
	type SxProps,
	type Theme,
} from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import { palette } from '@/common/theme';
import { useAppBar } from '../AppBarContext';

// ============================================================================
// Types & Styles
// ============================================================================

export interface AppBarItemProps {
	id: string;
	icon: ComponentType<{ size?: number; strokeWidth?: number }>;
	label: string;
	href?: string;
	onClick?: () => void;
	badge?: number | boolean;
	disabled?: boolean;
	/** Hide label on mobile */
	hideLabel?: boolean;
	/** Theme color name or hex code */
	color?: string;
}

type ColorPath =
	| 'primary'
	| 'secondary'
	| 'warning'
	| 'error'
	| 'success'
	| 'info';

interface PaletteColor {
	main: string;
	light?: string;
	dark?: string;
}

const getEffectiveColor = (color?: string): string => {
	if (!color) return palette.primary.light;
	if (color in palette) {
		const c = palette[color as ColorPath] as unknown as PaletteColor;
		return c.light || c.main || color;
	}
	return color;
};

interface AppBarItemStyles {
	button: CSSProperties;
	activeBg: SxProps<Theme>;
	indicator: CSSProperties;
	iconContainer: SxProps<Theme>;
	label: SxProps<Theme>;
	badge: SxProps<Theme>;
}

const makeStyles = (
	isMobile: boolean,
	isActive: boolean,
	disabled: boolean,
	effectiveColor: string,
): AppBarItemStyles => ({
	button: {
		position: 'relative',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: isMobile ? 0 : 4,
		padding: isMobile ? '10px 18px' : '12px 28px',
		minWidth: isMobile ? 56 : 84,
		border: 'none',
		background: 'transparent',
		cursor: disabled ? 'not-allowed' : 'pointer',
		opacity: disabled ? 0.35 : 1,
		outline: 'none',
		borderRadius: isMobile ? 14 : 24,
	},
	activeBg: {
		position: 'absolute',
		inset: isMobile ? '4px' : '6px',
		borderRadius: isMobile ? 12 : 18,
		bgcolor: alpha(effectiveColor, 0.12),
		zIndex: -1,
	},
	indicator: {
		position: 'absolute',
		bottom: isMobile ? -4 : -6,
		left: '50%',
		height: 4,
		borderRadius: '2px 2px 0 0',
		backgroundColor: effectiveColor,
		boxShadow: `0 -2px 10px ${alpha(effectiveColor, 0.8)}`,
	},
	iconContainer: {
		position: 'relative',
		color: isActive ? effectiveColor : alpha(effectiveColor, 0.4),
		transition: 'color 0.15s ease',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		fontSize: '0.75rem',
		fontWeight: 600,
		color: isActive ? effectiveColor : alpha(effectiveColor, 0.5),
		letterSpacing: '0.01em',
		whiteSpace: 'nowrap',
		transition: 'all 0.15s ease',
		mt: 0.5,
	},
	badge: {
		position: 'absolute',
		top: -6,
		right: -10,
		minWidth: 16,
		height: 16,
		px: 0.5,
		borderRadius: 8,
		bgcolor: palette.error.main,
		color: '#fff',
		fontSize: '0.6rem',
		fontWeight: 700,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: `0 2px 8px ${alpha(palette.error.main, 0.4)}`,
	},
});

const itemVariants: Variants = {
	idle: { scale: 1, y: 0 },
	hover: {
		scale: 1.05,
		y: -2,
		transition: { duration: 0.15, ease: 'easeOut' },
	},
	tap: { scale: 0.95 },
	active: { scale: 1, y: 0 },
};

const glowVariants: Variants = {
	idle: { opacity: 0, width: 0, x: '-50%' },
	active: {
		opacity: 1,
		width: 28,
		x: '-50%',
		transition: { duration: 0.25, ease: 'easeOut' },
	},
};

// ============================================================================
// Component
// ============================================================================

export function AppBarItem({
	id,
	icon: Icon,
	label,
	href,
	onClick,
	badge,
	disabled = false,
	hideLabel = false,
	color,
}: AppBarItemProps) {
	const { activeItem, setActiveItem } = useAppBar();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isActive = activeItem === id;
	const showLabel = !hideLabel && !isMobile;

	const effectiveColor = useMemo(() => getEffectiveColor(color), [color]);
	const styles = makeStyles(isMobile, isActive, disabled, effectiveColor);

	const handleClick = () => {
		if (disabled) return;
		setActiveItem(id);
		onClick?.();
		if (href) {
			window.location.href = href;
		}
	};

	return (
		<motion.button
			variants={itemVariants}
			initial='idle'
			whileHover={disabled ? undefined : 'hover'}
			whileTap={disabled ? undefined : 'tap'}
			animate={isActive ? 'active' : 'idle'}
			onClick={handleClick}
			disabled={disabled}
			style={styles.button}>
			{/* Active Background Glow */}
			{isActive && (
				<Box
					component={motion.div}
					layoutId='navbar-active-bg'
					transition={{
						type: 'spring',
						stiffness: 500,
						damping: 40,
						mass: 0.6,
					}}
					sx={styles.activeBg}
				/>
			)}

			{/* Active indicator bar */}
			<motion.div
				variants={glowVariants}
				initial='idle'
				animate={isActive ? 'active' : 'idle'}
				style={styles.indicator}
			/>

			{/* Icon */}
			<Box sx={styles.iconContainer}>
				<Icon size={isMobile ? 22 : 24} strokeWidth={isActive ? 2.5 : 2} />

				{/* Badge */}
				{badge && (
					<Box
						component={motion.div}
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						sx={styles.badge}>
						{typeof badge === 'number' ?
							badge > 99 ?
								'99+'
							:	badge
						:	''}
					</Box>
				)}
			</Box>

			{/* Label */}
			{showLabel && (
				<Box component='span' sx={styles.label}>
					{label}
				</Box>
			)}
		</motion.button>
	);
}
