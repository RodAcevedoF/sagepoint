'use client';

import { type ReactNode } from 'react';
import {
	Box,
	alpha,
	useMediaQuery,
	useTheme,
	type SxProps,
	type Theme,
} from '@mui/material';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { palette } from '@/common/theme';
import { AppBarProvider } from '../AppBarContext';
import { useHoverReveal } from '../useHoverReveal';

// ============================================================================
// Types & Styles
// ============================================================================

export interface AppBarProps {
	children: ReactNode;
	/** Show on hover at bottom of screen (default: true) */
	revealOnHover?: boolean;
	/** Always visible (disables hover reveal) */
	alwaysVisible?: boolean;
	/** Default active item id */
	defaultActive?: string | null;
}

const containerVariants: Variants = {
	hidden: {
		y: 40,
		opacity: 0,
		scale: 0.9,
	},
	visible: {
		y: 0,
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 30,
			mass: 0.8,
			staggerChildren: 0.05,
		},
	},
	exit: {
		y: 40,
		opacity: 0,
		scale: 0.9,
		transition: {
			duration: 0.25,
			ease: [0.4, 0, 1, 1],
		},
	},
};

const makeStyles = (
	isMobile: boolean,
	shouldShow: boolean,
): Record<string, SxProps<Theme>> => ({
	trigger: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		height: 100,
		zIndex: 1299,
		pointerEvents: shouldShow ? 'none' : 'auto',
	},
	barWrapper: {
		transform: 'translateX(-50%)',
		display: 'flex',
		alignItems: 'center',
		gap: { xs: 0.25, sm: 0.5 },
		px: { xs: 1, sm: 2 },
		py: { xs: 0.75, sm: 1.25 },
		borderRadius: { xs: 24, sm: 32 },
		// Advanced Glassmorphism
		background: `linear-gradient(135deg, ${alpha(
			palette.background.paper,
			0.82,
		)} 0%, ${alpha(palette.background.paper, 0.75)} 100%)`,
		backdropFilter: 'blur(32px) saturate(200%)',
		WebkitBackdropFilter: 'blur(32px) saturate(200%)',
		// Metallic/Glass Border
		border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
		// Depth and Shine
		boxShadow: `
      inset 0 1px 1px ${alpha('#fff', 0.12)},
      0 0 0 1px ${alpha(palette.background.default, 0.3)},
      0 12px 32px -8px ${alpha('#000', 0.3)},
      0 8px 16px -4px ${alpha(palette.primary.dark, 0.15)}
    `,
		transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
	},
});

// ============================================================================
// Component
// ============================================================================

export function AppBarRoot({
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
	const styles = makeStyles(isMobile, shouldShow);

	return (
		<AppBarProvider defaultActive={defaultActive}>
			{/* Invisible trigger zone at bottom (desktop only) */}
			{revealOnHover && !alwaysVisible && !isMobile && (
				<Box {...triggerProps} sx={styles.trigger} />
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
							position: 'fixed' as const,
							bottom: isMobile ? 16 : 24,
							left: '50%',
							zIndex: 1300,
						}}>
						<Box sx={styles.barWrapper}>{children}</Box>
					</motion.nav>
				)}
			</AnimatePresence>
		</AppBarProvider>
	);
}
