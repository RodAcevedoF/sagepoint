'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/common/components';

const AdminDocumentsTable = dynamic(
	() => import('@/features/admin/components/AdminDocumentsTable').then((m) => m.AdminDocumentsTable),
	{ loading: () => <Loader /> }
);

export default function AdminDocumentsPage() {
	return <AdminDocumentsTable />;
}
