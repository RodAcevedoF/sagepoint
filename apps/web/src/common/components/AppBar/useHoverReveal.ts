'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface HoverRevealOptions {
	/** Delay in ms before hiding after mouse leaves (default: 400ms) */
	hideDelay?: number;
	/** Disable the behavior */
	disabled?: boolean;
}

interface HoverRevealResult {
	isRevealed: boolean;
	/** Spread onto the invisible trigger zone element */
	triggerProps: { onMouseEnter?: () => void };
	/** Spread onto the bar element */
	barProps: {
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
	};
}

export function useHoverReveal(
	options: HoverRevealOptions = {},
): HoverRevealResult {
	const { hideDelay = 400, disabled = false } = options;
	const [isRevealed, setIsRevealed] = useState(false);
	const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearHideTimeout = () => {
		if (hideTimeout.current) {
			clearTimeout(hideTimeout.current);
			hideTimeout.current = null;
		}
	};

	const scheduleHide = () => {
		clearHideTimeout();
		hideTimeout.current = setTimeout(() => {
			setIsRevealed(false);
		}, hideDelay);
	};

	// Cleanup on unmount
	useEffect(() => () => clearHideTimeout(), []);

	const triggerProps = useMemo(
		() =>
			disabled
				? {}
				: {
						onMouseEnter: () => {
							clearHideTimeout();
							setIsRevealed(true);
						},
					},
		[disabled],
	);

	const barProps = useMemo(
		() =>
			disabled
				? {}
				: {
						onMouseEnter: () => clearHideTimeout(),
						onMouseLeave: () => scheduleHide(),
					},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[disabled, hideDelay],
	);

	return {
		isRevealed: disabled || isRevealed,
		triggerProps,
		barProps,
	};
}
