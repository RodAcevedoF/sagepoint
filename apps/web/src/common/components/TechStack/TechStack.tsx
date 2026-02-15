'use client';

import { Box, Typography, alpha, SxProps, Theme } from '@mui/material';
import { palette } from '@/common/theme';
import {
	Memory as TechIcon,
	Storage as DbIcon,
	AutoAwesome as AiIcon,
} from '@mui/icons-material';

const styles: Record<string, SxProps<Theme>> = {
	container: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 1,
		mt: 3,
	},
	techItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		color: palette.primary.light,
		fontSize: '0.7rem',
		fontWeight: 600,
		bgcolor: alpha(palette.primary.main, 0.08),
		px: 1.2,
		py: 0.6,
		borderRadius: '6px',
		border: `1px solid ${alpha(palette.primary.light, 0.15)}`,
		transition: 'all 0.2s ease',
		cursor: 'default',
		'&:hover': {
			bgcolor: alpha(palette.primary.main, 0.12),
			borderColor: alpha(palette.primary.light, 0.3),
			transform: 'translateY(-2px)',
		},
	},
};

/**
 * Reusable TechStack component that displays the core technologies
 * used in the project as styled chips.
 */
export function TechStack() {
	const techItems = [
		{ label: 'Next.js 15', icon: <TechIcon sx={{ fontSize: 16 }} /> },
		{ label: 'Neo4j Graph', icon: <DbIcon sx={{ fontSize: 16 }} /> },
		{ label: 'LLM Agent', icon: <AiIcon sx={{ fontSize: 16 }} /> },
	];

	return (
		<Box sx={styles.container}>
			{techItems.map((item) => (
				<Box key={item.label} sx={styles.techItem}>
					{item.icon}
					<Typography
						variant='inherit'
						sx={{
							whiteSpace: 'nowrap',
							fontSize: '0.75rem',
							letterSpacing: '0.02em',
						}}>
						{item.label}
					</Typography>
				</Box>
			))}
		</Box>
	);
}
