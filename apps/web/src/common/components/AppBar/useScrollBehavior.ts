'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrollBehaviorOptions {
	/** Threshold in pixels before hiding (default: 10) */
	threshold?: number;
	/** Disable the behavior entirely */
	disabled?: boolean;
}

interface ScrollBehaviorResult {
	isVisible: boolean;
	scrollDirection: 'up' | 'down' | null;
}

export function useScrollBehavior(
	options: ScrollBehaviorOptions = {},
): ScrollBehaviorResult {
	const { threshold = 10, disabled = false } = options;

	const [isVisible, setIsVisible] = useState(true);
	const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
		null,
	);

	const lastScrollY = useRef(0);

	const handleScroll = useCallback(() => {
		const currentScrollY = window.scrollY;
		const diff = currentScrollY - lastScrollY.current;

		if (Math.abs(diff) < threshold) {
			lastScrollY.current = currentScrollY;
			return;
		}

		const direction = diff > 0 ? 'down' : 'up';
		setScrollDirection(direction);

		if (currentScrollY < 50) {
			setIsVisible(true);
		} else if (direction === 'down') {
			setIsVisible(false);
		} else {
			setIsVisible(true);
		}

		lastScrollY.current = currentScrollY;
	}, [threshold]);

	useEffect(() => {
		if (disabled) return;

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [handleScroll, disabled]);

	return { isVisible, scrollDirection };
}
