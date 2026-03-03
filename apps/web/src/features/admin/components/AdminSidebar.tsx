'use client';

import { Box, Typography, alpha } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
	LayoutDashboard,
	Users,
	Map,
	FileText,
	BarChart3,
} from 'lucide-react';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';

const navItems = [
	{ href: '/admin', label: 'Overview', icon: LayoutDashboard },
	{ href: '/admin/users', label: 'Users', icon: Users },
	{ href: '/admin/roadmaps', label: 'Roadmaps', icon: Map },
	{ href: '/admin/documents', label: 'Documents', icon: FileText },
	{ href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<Card
			variant='glass'
			sx={{
				width: 220,
				flexShrink: 0,
				p: 1.5,
				position: 'sticky',
				top: 24,
				alignSelf: 'flex-start',
				display: { xs: 'none', md: 'block' },
			}}>
			<Typography
				sx={{
					fontSize: '0.7rem',
					fontWeight: 800,
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					color: palette.text.secondary,
					px: 1.5,
					py: 1,
					mb: 0.5,
				}}>
				Admin Panel
			</Typography>
			{navItems.map((item) => {
				const Icon = item.icon;
				const isActive =
					item.href === '/admin'
						? pathname === '/admin'
						: pathname.startsWith(item.href);

				return (
					<Box
						key={item.href}
						component={Link}
						href={item.href}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							px: 1.5,
							py: 1,
							borderRadius: 2,
							textDecoration: 'none',
							fontSize: '0.85rem',
							fontWeight: isActive ? 700 : 500,
							color: isActive
								? palette.primary.light
								: palette.text.secondary,
							bgcolor: isActive
								? alpha(palette.primary.main, 0.12)
								: 'transparent',
							transition: 'all 0.2s ease',
							'&:hover': {
								bgcolor: alpha(palette.primary.main, 0.08),
								color: palette.primary.light,
							},
						}}>
						<Icon size={18} />
						{item.label}
					</Box>
				);
			})}
		</Card>
	);
}
