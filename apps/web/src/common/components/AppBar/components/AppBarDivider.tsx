'use client';

import { Box, alpha } from '@mui/material';
import { palette } from '@/common/theme';

export function AppBarDivider() {
	return (
		<Box
			sx={{
				width: '1px',
				height: { xs: 20, sm: 24 },
				mx: { xs: 0.5, sm: 1 },
				background: `linear-gradient(to bottom, transparent, ${alpha(
					palette.text.secondary,
					0.2,
				)}, transparent)`,
			}}
		/>
	);
}
