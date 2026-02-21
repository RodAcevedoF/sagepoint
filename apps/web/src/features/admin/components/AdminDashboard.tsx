'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { useAppSelector } from '@/common/hooks';
import { Loader, ErrorState } from '@/common/components';
import { useAdminStatsQuery, useAdminUsersQuery } from '@/application/admin';
import { AdminStatsCards } from './AdminStatsCards';
import { AdminUsersTable } from './AdminUsersTable';
import { AdminHero } from './AdminHero';
import { AdminFooter } from './AdminFooter';

export function AdminDashboard() {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);

	const {
		data: stats,
		isLoading: statsLoading,
		isError: statsError,
	} = useAdminStatsQuery();
	const {
		data: users,
		isLoading: usersLoading,
		isError: usersError,
	} = useAdminUsersQuery();

	// Redirect non-admins
	useEffect(() => {
		if (user && user.role !== 'ADMIN') {
			router.push('/dashboard');
		}
	}, [user, router]);

	if (user?.role !== 'ADMIN') {
		return <Loader variant='page' message='Checking permissions' />;
	}

	if (statsLoading || usersLoading) {
		return <Loader variant='page' message='Loading admin dashboard' />;
	}

	if (statsError || usersError) {
		return (
			<ErrorState
				title='Failed to load admin data'
				description='Could not retrieve admin statistics. Please try again.'
			/>
		);
	}

	return (
		<Box>
			<AdminHero />

			{stats && <AdminStatsCards stats={stats} />}
			{users && <AdminUsersTable users={users} />}

			<AdminFooter />
		</Box>
	);
}
