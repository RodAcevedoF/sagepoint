'use client';

import { Box, Typography, Stack, Skeleton, alpha } from '@mui/material';
import { Newspaper, ArrowRight, ExternalLink } from 'lucide-react';
import { Card, EmptyState } from '@/common/components';
import { palette } from '@/common/theme';
import { useInsightsQuery } from '@/application/insights/queries/get-insights.query';

const CATEGORY_COLORS: Record<string, string> = {
	'web-development': palette.info.main,
	'mobile-development': palette.success.main,
	'machine-learning': palette.warning.main,
	'data-science': palette.secondary.main,
	devops: palette.error.main,
	cybersecurity: palette.error.dark,
	'cloud-computing': palette.info.dark,
	databases: palette.success.dark,
	'programming-languages': palette.warning.dark,
	'system-design': palette.primary.main,
};

function formatSlug(slug: string): string {
	return slug
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

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

function NewsSkeleton() {
	return (
		<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ flex: 1 }}>
			{[0, 1].map((i) => (
				<Box
					key={i}
					sx={{
						p: 2.5,
						borderRadius: 3,
						bgcolor: alpha(palette.text.primary, 0.02),
						border: `1px solid ${alpha(palette.text.primary, 0.05)}`,
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						gap: 1.5,
					}}>
					<Skeleton variant='rounded' width={44} height={44} sx={{ borderRadius: 2 }} animation='wave' />
					<Skeleton variant='text' width='40%' height={16} animation='wave' />
					<Skeleton variant='text' width='90%' height={20} animation='wave' />
					<Skeleton variant='text' width='100%' height={16} animation='wave' />
					<Skeleton variant='text' width='70%' height={16} animation='wave' />
				</Box>
			))}
		</Stack>
	);
}

export function DashboardNews() {
	const { data: articles, isLoading } = useInsightsQuery();
	const displayItems = (articles ?? []).slice(0, 4);

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

			{isLoading ? (
				<NewsSkeleton />
			) : displayItems.length === 0 ? (
				<EmptyState
					title='No insights yet'
					description='Complete onboarding or create roadmaps to get personalized news.'
				/>
			) : (
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2.5}
					sx={{ flex: 1, flexWrap: 'wrap' }}>
					{displayItems.map((item) => {
						const color = CATEGORY_COLORS[item.categorySlug] ?? palette.info.main;
						return (
							<Box
								key={item.url}
								component='a'
								href={item.url}
								target='_blank'
								rel='noopener noreferrer'
								sx={{
									...styles.newsItem(color),
									textDecoration: 'none',
									flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' },
									maxWidth: { sm: 'calc(50% - 10px)' },
								}}>
								<Stack
									direction='row'
									justifyContent='space-between'
									alignItems='flex-start'>
									<Box sx={styles.iconBox(color)}>
										<Newspaper size={22} />
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
										{item.source}
									</Box>
								</Stack>

								<Box>
									<Typography
										variant='subtitle2'
										sx={styles.category(color)}
										gutterBottom>
										{formatSlug(item.categorySlug)}
									</Typography>
									<Typography
										variant='body2'
										sx={{
											fontWeight: 700,
											lineHeight: 1.3,
											color: 'text.primary',
											mb: 1,
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
										color,
									}}>
									<ExternalLink size={16} />
								</Box>
							</Box>
						);
					})}
				</Stack>
			)}
		</Card>
	);
}
