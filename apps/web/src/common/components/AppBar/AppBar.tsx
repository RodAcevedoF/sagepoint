'use client';

import { type ReactNode, type ComponentType } from 'react';
import { Box, alpha, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { palette } from '@/common/theme';
import { AppBarProvider, useAppBar } from './AppBarContext';
import { useHoverReveal } from './useHoverReveal';

interface AppBarProps {
	children: ReactNode;
	/** Show on hover at bottom of screen (default: true) */
	revealOnHover?: boolean;
	/** Always visible (disables hover reveal) */
	alwaysVisible?: boolean;
	/** Default active item id */
	defaultActive?: string | null;
}

interface AppBarItemProps {
	id: string;
	icon: ComponentType<{ size?: number; strokeWidth?: number }>;
	label: string;
	href?: string;
	onClick?: () => void;
	badge?: number | boolean;
	disabled?: boolean;
	/** Hide label on mobile */
	hideLabel?: boolean;
}

interface AppBarActionProps {
	icon: ComponentType<{ size?: number; strokeWidth?: number }>;
	label: string;
	onClick?: () => void;
	variant?: 'default' | 'primary' | 'glow';
}

interface AppBarGroupProps {
	children: ReactNode;
}

const containerVariants: Variants = {
	hidden: {
		y: 20,
		opacity: 0,
		scale: 0.95,
	},
	visible: {
		y: 0,
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 500,
			damping: 35,
			mass: 0.8,
		},
	},
	exit: {
		y: 20,
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.2,
			ease: [0.4, 0, 1, 1],
		},
	},
};

const itemVariants: Variants = {
	idle: { scale: 1, y: 0 },
	hover: { scale: 1.05, y: -2 },
	tap: { scale: 0.95 },
	active: { scale: 1, y: 0 },
};

const glowVariants: Variants = {
	idle: { opacity: 0, width: 0 },
	active: {
		opacity: 1,
		width: 24,
		transition: { duration: 0.25, ease: 'easeOut' },
	},
};

// Main
function AppBarRoot({
	children,
	revealOnHover = true,
	alwaysVisible = false,
	defaultActive,
}: AppBarProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { isRevealed, triggerProps, barProps } = useHoverReveal({
		disabled: alwaysVisible || isMobile, // Always visible on mobile
		hideDelay: 500,
	});

	const shouldShow = alwaysVisible || isMobile || isRevealed;

	return (
		<AppBarProvider defaultActive={defaultActive}>
			{/* Invisible trigger zone at bottom (desktop only) */}
			{revealOnHover && !alwaysVisible && !isMobile && (
				<Box
					{...triggerProps}
					sx={{
						position: 'fixed',
						bottom: 0,
						left: 0,
						right: 0,
						height: 100,
						zIndex: 1299,
						pointerEvents: shouldShow ? 'none' : 'auto',
					}}
				/>
			)}

			<AnimatePresence>
				{shouldShow && (
					<motion.nav
						variants={containerVariants}
						initial='hidden'
						animate='visible'
						exit='exit'
						{...barProps}
						style={{
							position: 'fixed',
							bottom: isMobile ? 16 : 24,
							left: '50%',
							zIndex: 1300,
						}}>
						<Box
							sx={{
								transform: 'translateX(-50%)',
								display: 'flex',
								alignItems: 'center',
								gap: { xs: 0.25, sm: 0.5 },
								px: { xs: 1.5, sm: 2.5 },
								py: { xs: 1, sm: 1.5 },
								borderRadius: { xs: 3, sm: 4 },
								// Glassmorphism
								bgcolor: alpha(palette.background.paper, 0.85),
								backdropFilter: 'blur(24px) saturate(180%)',
								WebkitBackdropFilter: 'blur(24px) saturate(180%)',
								// Border
								border: `1px solid ${alpha(palette.primary.light, 0.12)}`,
								// Layered shadows for depth
								boxShadow: `
                  0 0 0 1px ${alpha(palette.background.default, 0.5)},
                  0 4px 12px ${alpha('#000', 0.15)},
                  0 8px 32px ${alpha(palette.primary.dark, 0.1)}
                `,
							}}>
							{children}
						</Box>
					</motion.nav>
				)}
			</AnimatePresence>
		</AppBarProvider>
	);
}

function AppBarItem({
	id,
	icon: Icon,
	label,
	href,
	onClick,
	badge,
	disabled = false,
	hideLabel = false,
}: AppBarItemProps) {
	const { activeItem, setActiveItem } = useAppBar();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isActive = activeItem === id;
	const showLabel = !hideLabel && !isMobile;

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
			style={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
				padding: isMobile ? '10px 14px' : '10px 18px',
				minWidth: isMobile ? 48 : 56,
				border: 'none',
				background:
					isActive ? alpha(palette.primary.main, 0.12) : 'transparent',
				cursor: disabled ? 'not-allowed' : 'pointer',
				opacity: disabled ? 0.4 : 1,
				outline: 'none',
				borderRadius: isMobile ? 10 : 12,
				transition: 'background 0.2s ease',
			}}>
			{/* Active indicator bar */}
			<motion.div
				variants={glowVariants}
				initial='idle'
				animate={isActive ? 'active' : 'idle'}
				style={{
					position: 'absolute',
					bottom: isMobile ? -6 : -8,
					left: '50%',
					transform: 'translateX(-50%)',
					height: 3,
					borderRadius: 2,
					backgroundColor: palette.primary.light,
					boxShadow: `0 0 12px ${alpha(palette.primary.light, 0.6)}`,
				}}
			/>

			{/* Icon */}
			<Box
				sx={{
					position: 'relative',
					color: isActive ? palette.primary.light : palette.text.secondary,
					transition: 'color 0.2s ease',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<Icon size={isMobile ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />

				{/* Badge */}
				{badge && (
					<Box
						component={motion.div}
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						sx={{
							position: 'absolute',
							top: -6,
							right: -8,
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
						}}>
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
				<Box
					component='span'
					sx={{
						fontSize: '0.65rem',
						fontWeight: isActive ? 600 : 500,
						color: isActive ? palette.primary.light : palette.text.secondary,
						letterSpacing: 0.2,
						whiteSpace: 'nowrap',
						transition: 'color 0.2s ease',
					}}>
					{label}
				</Box>
			)}
		</motion.button>
	);
}

// ============================================================================
// AppBar.Action - Center action button (FAB-like)
// ============================================================================

function AppBarAction({
	icon: Icon,
	label,
	onClick,
	variant = 'primary',
}: AppBarActionProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const size = isMobile ? 44 : 50;

	return (
		<Box sx={{ position: 'relative', mx: { xs: 0.5, sm: 1 } }}>
			{/* Pulse ring for glow variant */}
			{variant === 'glow' && (
				<Box
					sx={{
						position: 'absolute',
						inset: -3,
						borderRadius: '50%',
						border: `2px solid ${alpha(palette.primary.light, 0.25)}`,
						animation: 'appbar-pulse 2.5s ease-in-out infinite',
						'@keyframes appbar-pulse': {
							'0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
							'50%': { transform: 'scale(1.12)', opacity: 0 },
						},
					}}
				/>
			)}
			<motion.button
				whileHover={{ scale: 1.08, y: -2 }}
				whileTap={{ scale: 0.95 }}
				onClick={onClick}
				aria-label={label}
				style={{
					position: 'relative',
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
						:	`linear-gradient(145deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
					boxShadow:
						variant === 'glow' ?
							`0 4px 20px ${alpha(palette.primary.main, 0.35)}, 0 0 30px ${alpha(palette.primary.light, 0.15)}`
						: variant === 'primary' ?
							`0 4px 16px ${alpha(palette.primary.main, 0.3)}`
						:	`0 2px 8px ${alpha('#000', 0.1)}`,
					transition: 'box-shadow 0.3s ease',
				}}>
				<Icon size={isMobile ? 20 : 22} strokeWidth={2.5} />
			</motion.button>
		</Box>
	);
}

// ============================================================================
// AppBar.Group - Group items together
// ============================================================================

function AppBarGroup({ children }: AppBarGroupProps) {
	return (
		<Box
			sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.25 } }}>
			{children}
		</Box>
	);
}

// ============================================================================
// AppBar.Divider - Visual separator
// ============================================================================

function AppBarDivider() {
	return (
		<Box
			sx={{
				width: 1,
				height: { xs: 28, sm: 32 },
				mx: { xs: 0.75, sm: 1.5 },
				bgcolor: alpha(palette.text.secondary, 0.15),
				borderRadius: 1,
			}}
		/>
	);
}

// ============================================================================
// Compound Component Export
// ============================================================================

export const AppBar = Object.assign(AppBarRoot, {
	Item: AppBarItem,
	Action: AppBarAction,
	Group: AppBarGroup,
	Divider: AppBarDivider,
});
