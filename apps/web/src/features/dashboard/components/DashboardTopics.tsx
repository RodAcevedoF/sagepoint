'use client';

import { useState } from 'react';
import { Box, Typography, Stack, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import type { TopicDistribution } from '../types/dashboard.types';

// ============================================================================
// Styles
// ============================================================================

const styles = {
	card: {
		p: 3,
		height: '100%',
		position: 'relative',
		display: 'flex',
		flexDirection: 'column',
	},
	title: {
		fontWeight: 700,
		mb: 4,
		color: 'text.primary',
		letterSpacing: '-0.01em',
	},
	ringContainer: {
		position: 'relative' as const,
		width: 200, // Increased from 180 to prevent cutting
		height: 200,
		mx: 'auto',
		mb: 4,
	},
	svg: {
		transform: 'rotate(-90deg)',
		filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
		overflow: 'visible', // Added to ensure hover stroke doesn't cut
	},
	centerText: {
		position: 'absolute' as const,
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		textAlign: 'center' as const,
		zIndex: 2,
		pointerEvents: 'none' as const,
		width: '100%', // Added
	},
	centerValue: {
		fontWeight: 800,
		fontSize: '1.75rem',
		lineHeight: 1,
		color: 'text.primary',
	},
	centerLabel: {
		color: 'text.secondary',
		fontSize: '0.7rem',
		fontWeight: 600,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.1em',
		mt: 0.5,
	},
	legendItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		p: 1.5,
		borderRadius: 2,
		transition: 'all 0.2s ease',
		cursor: 'default',
		'&:hover': {
			bgcolor: alpha(palette.primary.light, 0.04),
		},
	},
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: '50%',
		mr: 2,
		boxShadow: '0 0 8px currentColor',
	},
	legendLabel: {
		display: 'flex',
		alignItems: 'center',
		flex: 1,
	},
	legendValue: {
		fontWeight: 700,
		fontSize: '0.9rem',
		color: 'text.primary',
	},
	backgroundCircle: {
		fill: 'none',
		stroke: alpha(palette.primary.light, 0.05),
		strokeWidth: 14,
	},
};

// ============================================================================
// Component
// ============================================================================

interface DashboardTopicsProps {
	distribution: TopicDistribution[];
	overallProgress: number; // Added
}

export function DashboardTopics({
	distribution,
	overallProgress,
}: DashboardTopicsProps) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const totalSteps = distribution.reduce((sum, d) => sum + d.value, 0);

	// Constants
	const size = 200; // Updated
	const radius = 80; // (200 - 40) / 2
	const circumference = 2 * Math.PI * radius;

	// Derive offsets for segments without variable reassignment to satisfy linter
	const segments = distribution.map((topic, index) => {
		const value = (topic.value / totalSteps) * 100;
		const previousValueSum = distribution
			.slice(0, index)
			.reduce((sum, d) => sum + d.value, 0);
		const offset = (previousValueSum / totalSteps) * circumference;
		return { ...topic, offset, value };
	});

	return (
		<Card variant='glass' hoverable={false} sx={styles.card}>
			<Typography variant='h6' sx={styles.title}>
				Topic Diversity
			</Typography>

			<Box sx={styles.ringContainer}>
				<svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					style={styles.svg}>
					{/* Background Track */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						style={styles.backgroundCircle}
						strokeWidth={12}
					/>

					{/* Segments */}
					{segments.map((topic, index) => {
						const isHovered = hoveredIndex === index;
						const isAnyHovered = hoveredIndex !== null;
						const dashArray = (topic.value / 100) * circumference;

						return (
							<motion.circle
								key={topic.name}
								cx={size / 2}
								cy={size / 2}
								r={radius}
								fill='none'
								stroke={topic.color}
								strokeWidth={isHovered ? 16 : 12}
								strokeDasharray={`${dashArray} ${circumference}`}
								strokeDashoffset={-topic.offset}
								strokeLinecap='round'
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{
									pathLength: 1,
									opacity: isAnyHovered && !isHovered ? 0.3 : 1,
									filter:
										isHovered ? `drop-shadow(0 0 8px ${topic.color})` : 'none',
								}}
								transition={{
									pathLength: {
										duration: 1,
										delay: index * 0.1,
										ease: 'easeOut',
									},
									opacity: { duration: 0.2 },
									strokeWidth: { type: 'spring', stiffness: 300, damping: 20 },
								}}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								style={{
									cursor: 'pointer',
									transition: 'stroke-width 0.3s ease',
								}}
							/>
						);
					})}
				</svg>

				<Box sx={styles.centerText}>
					<AnimatePresence mode='wait'>
						{hoveredIndex !== null ?
							<motion.div
								key='detail'
								initial={{ opacity: 0, scale: 0.9, y: 5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: -5 }}
								transition={{ duration: 0.2 }}>
								<Typography
									sx={{
										...styles.centerValue,
										color: segments[hoveredIndex].color,
									}}>
									{segments[hoveredIndex].value.toFixed(0)}%
								</Typography>
								<Typography sx={styles.centerLabel}>
									{segments[hoveredIndex].name}
								</Typography>
							</motion.div>
						:	<motion.div
								key='total'
								initial={{ opacity: 0, scale: 0.9, y: 5 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: -5 }}
								transition={{ duration: 0.2 }}>
								<Typography sx={styles.centerValue}>
									{overallProgress}%
								</Typography>
								<Typography sx={styles.centerLabel}>Mastered</Typography>
							</motion.div>
						}
					</AnimatePresence>
				</Box>
			</Box>

			<Stack spacing={0.5}>
				{segments.map((topic, index) => {
					const isHovered = hoveredIndex === index;
					return (
						<Box
							key={topic.name}
							sx={{
								...styles.legendItem,
								bgcolor: isHovered ? alpha(topic.color, 0.08) : 'transparent',
								transform: isHovered ? 'translateX(4px)' : 'none',
							}}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}>
							<Box sx={styles.legendLabel}>
								<Box
									sx={{
										...styles.legendDot,
										bgcolor: topic.color,
										color: topic.color,
									}}
								/>
								<Typography
									variant='body2'
									sx={{
										fontWeight: isHovered ? 600 : 400,
										color: isHovered ? topic.color : 'text.secondary',
									}}>
									{topic.name}
								</Typography>
							</Box>
							<Typography
								sx={{
									...styles.legendValue,
									color: isHovered ? topic.color : 'text.primary',
								}}>
								{topic.value.toFixed(0)}%
							</Typography>
						</Box>
					);
				})}
			</Stack>
		</Card>
	);
}
