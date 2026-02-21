'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/common/hooks';
import { useProfileQuery } from '@/application/auth/queries/get-profile.query';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
	const { refetch } = useProfileQuery();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const pathname = usePathname();
	const prevPathname = useRef(pathname);

	// Re-validate session on navigation when not authenticated.
	// Fixes stale cached error after login (server action sets cookies then redirects,
	// but AuthInitializer stays mounted so the failed getProfile result persists).
	useEffect(() => {
		const pathChanged = prevPathname.current !== pathname;
		prevPathname.current = pathname;

		if (pathChanged && !isAuthenticated) {
			refetch();
		}
	}, [pathname, isAuthenticated, refetch]);

	return <>{children}</>;
}
