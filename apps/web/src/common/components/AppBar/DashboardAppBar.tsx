'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, FileText, User, Plus } from 'lucide-react';
import { AppBar } from './AppBar';

export function DashboardAppBar() {
	const router = useRouter();
	const pathname = usePathname();

	const getActiveItem = () => {
		if (pathname === '/dashboard') return 'home';
		if (pathname.startsWith('/roadmaps')) return 'roadmaps';
		if (pathname.startsWith('/documents')) return 'documents';
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
				/>
				<AppBar.Item
					id='roadmaps'
					icon={Map}
					label='Roadmaps'
					onClick={() => router.push('/roadmaps')}
				/>
			</AppBar.Group>

			<AppBar.Divider />

			<AppBar.Action
				icon={Plus}
				label='Create new'
				variant='glow'
				onClick={() => router.push('/roadmaps/create')}
			/>

			<AppBar.Divider />

			<AppBar.Group>
				<AppBar.Item
					id='documents'
					icon={FileText}
					label='Docs'
					onClick={() => router.push('/dashboard')}
				/>
				<AppBar.Item
					id='profile'
					icon={User}
					label='Profile'
					onClick={() => router.push('/profile')}
				/>
			</AppBar.Group>
		</AppBar>
	);
}
