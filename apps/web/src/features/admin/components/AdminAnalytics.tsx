'use client';

import { useState } from 'react';
import { Box, Typography, Grid, alpha, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { EmptyState, Loader, ErrorState } from '@/common/components';
import { palette } from '@/common/theme';
import { motion } from 'framer-motion';
import { BarChart3, Users, FileText, Map, DollarSign } from 'lucide-react';
import { useAdminAnalyticsQuery } from '@/application/admin';
import { AnalyticsChartCard } from './AnalyticsChartCard';

const periodOptions = [
	{ value: 7, label: '7d' },
	{ value: 30, label: '30d' },
	{ value: 90, label: '90d' },
];

function formatDateLabel(dateStr: string): string {
	const d = new Date(dateStr);
	return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function addLabels(points: { date: string; count: number }[]) {
	return points.map((p) => ({ ...p, label: formatDateLabel(p.date) }));
}

export function AdminAnalytics() {
	const [days, setDays] = useState(30);
	const { data, isLoading, isError } = useAdminAnalyticsQuery({ days });

	if (isLoading)
		return <Loader variant='page' message='Loading analytics' />;
	if (isError)
		return (
			<ErrorState
				title='Failed to load analytics'
				description='Could not retrieve analytics data.'
			/>
		);

	const signups = addLabels(data?.signups ?? []);
	const uploads = addLabels(data?.uploads ?? []);
	const generations = addLabels(data?.generations ?? []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 3,
				}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<BarChart3 size={22} color={palette.primary.main} />
					<Typography
						variant='h6'
						sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
						Analytics
					</Typography>
				</Box>
				<ToggleButtonGroup
					value={days}
					exclusive
					onChange={(_, val) => val !== null && setDays(val)}
					size='small'>
					{periodOptions.map((opt) => (
						<ToggleButton
							key={opt.value}
							value={opt.value}
							sx={{
								px: 2,
								fontSize: '0.8rem',
								fontWeight: 700,
								textTransform: 'none',
								color: palette.text.secondary,
								'&.Mui-selected': {
									bgcolor: alpha(palette.primary.main, 0.15),
									color: palette.primary.light,
								},
							}}>
							{opt.label}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
			</Box>

			<Grid container spacing={2.5}>
				<Grid size={{ xs: 12, md: 6 }}>
					<AnalyticsChartCard
						icon={<Users size={18} color={palette.info.main} />}
						title='User Growth'
						data={signups}
						color={palette.info.main}
						variant='area'
						gradientId='signupGrad'
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<AnalyticsChartCard
						icon={<FileText size={18} color={palette.secondary.light} />}
						title='Document Uploads'
						data={uploads}
						color={palette.secondary.light}
						variant='bar'
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<AnalyticsChartCard
						icon={<Map size={18} color={palette.primary.main} />}
						title='Roadmap Generations'
						data={generations}
						color={palette.primary.main}
						variant='line'
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<AnalyticsChartCard
						icon={<DollarSign size={18} color={palette.warning.main} />}
						title='AI Costs'
						data={[]}
						color={palette.warning.main}
						variant='bar'
						placeholder={
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									height: 220,
								}}>
								<EmptyState
									title='Coming Soon'
									description='AI cost tracking will be available in a future release.'
								/>
							</Box>
						}
					/>
				</Grid>
			</Grid>
		</motion.div>
	);
}
