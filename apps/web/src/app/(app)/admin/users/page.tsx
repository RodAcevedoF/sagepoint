'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/common/components';

const AdminUsersTable = dynamic(
	() => import('@/features/admin/components/AdminUsersTable').then((m) => m.AdminUsersTable),
	{ loading: () => <Loader /> }
);

export default function AdminUsersPage() {
	return <AdminUsersTable />;
}
