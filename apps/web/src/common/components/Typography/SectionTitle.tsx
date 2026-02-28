'use client';

import React, { ReactNode } from 'react';
import { Typography, Box, useTheme, SxProps, Theme } from '@mui/material';
import { makeStyles } from './SectionTitle.styles';

interface SectionTitleProps {
	children: ReactNode;
	subtitle?: ReactNode;
	gradient?: boolean;
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	showBar?: boolean;
	sx?: SxProps<Theme>;
}

export function SectionTitle({
	children,
	subtitle,
	gradient = true,
	variant = 'h4',
	showBar = true,
	sx,
}: SectionTitleProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	return (
		<Box sx={[styles.container, ...(Array.isArray(sx) ? sx : [sx])]}>
			<Box sx={styles.header}>
				{showBar && <Box sx={styles.bar(variant)} />}
				<Typography variant={variant} sx={styles.title(gradient)}>
					{children}
				</Typography>
			</Box>
			{subtitle && (
				<Box sx={styles.subtitleContainer(showBar)}>
					{typeof subtitle === 'string' ?
						<Typography variant='body1' sx={styles.subtitleText}>
							{subtitle}
						</Typography>
					:	subtitle}
				</Box>
			)}
		</Box>
	);
}
