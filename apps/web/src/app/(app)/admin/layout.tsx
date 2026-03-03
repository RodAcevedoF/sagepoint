'use client';

import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<Container maxWidth='lg' sx={{ py: 4 }}>
			<Box sx={{ display: 'flex', gap: 3 }}>
				<AdminSidebar />
				<Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
			</Box>
		</Container>
	);
}
