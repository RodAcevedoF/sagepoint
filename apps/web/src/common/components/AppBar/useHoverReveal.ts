'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface HoverRevealOptions {
	/** Delay in ms before hiding after mouse leaves (default: 400ms) */
	hideDelay?: number;
	/** Disable the behavior */
	disabled?: boolean;
}

interface HoverRevealResult {
	isRevealed: boolean;
	/** Spread onto the invisible trigger zone element */
	triggerProps: {
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
	};
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
	const [isRevealed, setIsRevealed] = useState(true);
	const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearHideTimeout = useCallback(() => {
		if (hideTimeout.current) {
			clearTimeout(hideTimeout.current);
			hideTimeout.current = null;
		}
	}, []);

	const scheduleHide = useCallback(() => {
		clearHideTimeout();
		hideTimeout.current = setTimeout(() => {
			setIsRevealed(false);
		}, hideDelay);
	}, [clearHideTimeout, hideDelay]);

	// Show briefly on mount, then auto-hide after 1s
	useEffect(() => {
		if (disabled) return;
		const timer = setTimeout(() => setIsRevealed(false), 1000);
		return () => clearTimeout(timer);
	}, [disabled]);

	// Cleanup on unmount
	useEffect(() => () => clearHideTimeout(), [clearHideTimeout]);

	const triggerProps = useMemo(
		() =>
			disabled ?
				{}
			:	{
					onMouseEnter: () => {
						clearHideTimeout();
						setIsRevealed(true);
					},
					onMouseLeave: () => scheduleHide(),
				},
		[disabled, clearHideTimeout, scheduleHide],
	);

	const barProps = useMemo(
		() =>
			disabled ?
				{}
			:	{
					onMouseEnter: () => clearHideTimeout(),
					onMouseLeave: () => scheduleHide(),
				},
		[disabled, clearHideTimeout, scheduleHide],
	);

	return {
		isRevealed: disabled || isRevealed,
		triggerProps,
		barProps,
	};
}
