'use client';

import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
	rootMargin?: string;
}

export function useInfiniteScroll(
	onLoadMore: () => void,
	enabled: boolean,
	options?: UseInfiniteScrollOptions,
) {
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || !enabled) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) onLoadMore();
			},
			{ rootMargin: options?.rootMargin ?? '200px' },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [enabled, onLoadMore, options?.rootMargin]);

	return sentinelRef;
}
