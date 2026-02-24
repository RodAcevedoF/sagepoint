'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, FileText, User, Shield } from 'lucide-react';
import { useAppSelector } from '@/common/hooks';
import { AppBar } from './AppBar';

export function DashboardAppBar() {
	const router = useRouter();
	const pathname = usePathname();
	const { user } = useAppSelector((state) => state.auth);

	const isAdmin = user?.role === 'ADMIN';

	const getActiveItem = () => {
		if (pathname === '/dashboard') return 'home';
		if (pathname.startsWith('/roadmaps')) return 'roadmaps';
		if (pathname.startsWith('/documents')) return 'documents';
		if (pathname.startsWith('/admin')) return 'admin';
		if (pathname.startsWith('/profile')) return 'profile';
		return null;
	};

	return (
		<AppBar revealOnHover defaultActive={getActiveItem()}>
			<AppBar.Group>
				<AppBar.Item
					id='home'
					icon={Home}
					label='Home'
					onClick={() => router.push('/dashboard')}
					color='primary'
				/>
				<AppBar.Item
					id='roadmaps'
					icon={Map}
					label='Roadmaps'
					onClick={() => router.push('/roadmaps')}
					color='warning'
				/>
			</AppBar.Group>

			<AppBar.Divider />

			<AppBar.Group>
				<AppBar.Item
					id='documents'
					icon={FileText}
					label='Docs'
					onClick={() => router.push('/documents')}
					color='info'
				/>
				<AppBar.Item
					id='profile'
					icon={User}
					label='Profile'
					onClick={() => router.push('/profile')}
					color='success'
				/>
				{isAdmin && (
					<AppBar.Item
						id='admin'
						icon={Shield}
						label='Admin'
						onClick={() => router.push('/admin')}
						color='error'
					/>
				)}
			</AppBar.Group>
		</AppBar>
	);
}
