'use client';

import { Box, Typography, Stack, alpha } from '@mui/material';
import { Newspaper, ArrowRight, Lightbulb, BookOpen } from 'lucide-react';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';

// ============================================================================
// Constants & Types
// ============================================================================

const NEWS_ITEMS = [
	{
		id: 1,
		title: 'Mastering the Pomodoro Technique for Complex Study',
		category: 'Productivity',
		icon: Lightbulb,
		color: palette.warning.main,
		readTime: '5 min read',
		description:
			'Boost your focus by breaking down complex theoretical topics into smaller chunks.',
	},
	{
		id: 2,
		title: 'Leveraging AI for Your Learning Journey',
		category: 'Technology',
		icon: BookOpen,
		color: palette.info.main,
		readTime: '8 min read',
		description:
			'Discover how to use LLMs to explain concepts in different difficulty levels.',
	},
];

const styles = {
	card: {
		p: 3,
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 3,
	},
	title: {
		fontWeight: 600,
		display: 'flex',
		alignItems: 'center',
		gap: 1.5,
	},
	newsItem: (color: string) => ({
		p: 2.5,
		borderRadius: 3,
		bgcolor: alpha(color, 0.05),
		border: `1px solid ${alpha(color, 0.1)}`,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		cursor: 'pointer',
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		gap: 1.5,
		position: 'relative',
		overflow: 'hidden',
		'&:hover': {
			bgcolor: alpha(color, 0.08),
			borderColor: color,
			transform: 'translateY(-4px)',
			boxShadow: `0 8px 16px ${alpha(color, 0.1)}`,
			'& .news-arrow': {
				transform: 'translateX(4px)',
				opacity: 1,
			},
		},
	}),
	iconBox: (color: string) => ({
		width: 44,
		height: 44,
		borderRadius: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(color, 0.15),
		color: color,
		mb: 0.5,
	}),
	category: (color: string) => ({
		fontSize: '0.7rem',
		fontWeight: 800,
		color: color,
		textTransform: 'uppercase',
		letterSpacing: '0.8px',
	}),
};

// ============================================================================
// Component
// ============================================================================

export function DashboardNews() {
	return (
		<Card sx={styles.card} variant='glass'>
			<Box sx={styles.header}>
				<Typography variant='h6' sx={styles.title}>
					<Box
						sx={{
							p: 0.8,
							borderRadius: 1.5,
							bgcolor: alpha(palette.info.main, 0.1),
							display: 'flex',
							color: palette.info.main,
						}}>
						<Newspaper size={18} />
					</Box>
					Learning Insights
				</Typography>
				<Typography
					variant='body2'
					sx={{
						color: palette.info.light,
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						cursor: 'pointer',
						fontWeight: 500,
						'&:hover': { color: palette.info.main },
					}}>
					Feed <ArrowRight size={14} />
				</Typography>
			</Box>

			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2.5}
				sx={{ flex: 1 }}>
				{NEWS_ITEMS.map((item) => (
					<Box key={item.id} sx={styles.newsItem(item.color)}>
						<Stack
							direction='row'
							justifyContent='space-between'
							alignItems='flex-start'>
							<Box sx={styles.iconBox(item.color)}>
								<item.icon size={22} />
							</Box>
							<Box
								sx={{
									px: 1,
									py: 0.4,
									borderRadius: 1,
									bgcolor: alpha(palette.text.primary, 0.04),
									fontSize: '0.65rem',
									fontWeight: 600,
									color: 'text.secondary',
								}}>
								{item.readTime}
							</Box>
						</Stack>

						<Box>
							<Typography
								variant='subtitle2'
								sx={styles.category(item.color)}
								gutterBottom>
								{item.category}
							</Typography>
							<Typography
								variant='body2'
								sx={{
									fontWeight: 700,
									lineHeight: 1.3,
									color: 'text.primary',
									mb: 1,
									// Clamp to 2 lines
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}>
								{item.title}
							</Typography>
							<Typography
								variant='caption'
								sx={{
									color: 'text.secondary',
									lineHeight: 1.4,
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}>
								{item.description}
							</Typography>
						</Box>

						<Box
							className='news-arrow'
							sx={{
								position: 'absolute',
								bottom: 12,
								right: 12,
								opacity: 0,
								transition: 'all 0.3s ease',
								color: item.color,
							}}>
							<ArrowRight size={16} />
						</Box>
					</Box>
				))}
			</Stack>
		</Card>
	);
}
