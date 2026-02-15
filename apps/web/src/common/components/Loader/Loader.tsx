'use client';

import {
	Box,
	CircularProgress,
	Typography,
	alpha,
	SxProps,
	Theme,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { palette } from '@/common/theme';

const pulse = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
`;

interface LoaderProps {
	variant?: 'circular' | 'page';
	message?: string;
	size?: number;
	sx?: SxProps<Theme>;
}

export function Loader({
	variant = 'circular',
	message,
	size,
	sx,
}: LoaderProps) {
	if (variant === 'page') {
		const squareSize = size ? size / 4 : 10;
		const gap = 6;

		return (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '300px',
					width: '100%',
					gap: 3,
					...sx,
				}}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: `repeat(3, ${squareSize}px)`,
						gridTemplateRows: `repeat(3, ${squareSize}px)`,
						gap: `${gap}px`,
					}}>
					{[...Array(9)].map((_, i) => (
						<Box
							key={i}
							sx={{
								width: squareSize,
								height: squareSize,
								bgcolor: palette.primary.main,
								borderRadius: '2px',
								animation: `${pulse} 1.2s ease-in-out infinite`,
								// Stagger the animation in a diagonal wave pattern
								animationDelay: `${((i % 3) + Math.floor(i / 3)) * 0.15}s`,
								boxShadow: `0 0 12px ${alpha(palette.primary.main, 0.3)}`,
							}}
						/>
					))}
				</Box>

				{message && (
					<Typography
						variant='body2'
						sx={{
							color: palette.primary.light,
							fontWeight: 600,
							letterSpacing: '0.15em',
							textTransform: 'uppercase',
							fontSize: '0.75rem',
							opacity: 0.8,
						}}>
						{message}
					</Typography>
				)}
			</Box>
		);
	}

	// Circular / Inline Variant: Standard MUI Spinner
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 1,
				gap: 1.5,
				...sx,
			}}>
			<CircularProgress
				size={size || 24}
				thickness={5}
				sx={{
					color: palette.primary.main,
					'& .MuiCircularProgress-circle': {
						strokeLinecap: 'round',
					},
				}}
			/>
			{message && (
				<Typography
					variant='body2'
					color='text.secondary'
					sx={{ fontWeight: 500, letterSpacing: '0.01em' }}>
					{message}
				</Typography>
			)}
		</Box>
	);
}

export default Loader;
