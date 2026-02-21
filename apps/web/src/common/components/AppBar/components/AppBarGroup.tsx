'use client';

import { type ReactNode } from 'react';
import { Box } from '@mui/material';

export interface AppBarGroupProps {
	children: ReactNode;
}

export function AppBarGroup({ children }: AppBarGroupProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: { xs: 0, sm: 0.25 },
			}}>
			{children}
		</Box>
	);
}
