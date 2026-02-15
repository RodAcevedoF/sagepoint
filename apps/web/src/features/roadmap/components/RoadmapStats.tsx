'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { Map, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { UserRoadmapDto } from '@/infrastructure/api/roadmapApi';
import { makeStyles } from './RoadmapStats.styles';

const MotionBox = motion.create(Box);

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: number;
	color: string;
	index: number;
}

function StatCard({ icon: Icon, label, value, color, index }: StatCardProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	return (
		<MotionBox
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
			sx={styles.card(color)}>
			<Box sx={styles.iconContainer(color)}>
				<Icon size={20} />
			</Box>
			<Typography variant='h4' sx={styles.value(color)}>
				{value}
			</Typography>
			<Typography variant='caption' sx={styles.label}>
				{label}
			</Typography>
		</MotionBox>
	);
}

interface RoadmapStatsProps {
	roadmaps: UserRoadmapDto[];
}

export function RoadmapStats({ roadmaps }: RoadmapStatsProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	const completed = roadmaps.filter(
		(r) => r.progress.progressPercentage === 100,
	).length;
	const inProgress = roadmaps.filter(
		(r) =>
			r.progress.inProgressSteps > 0 && r.progress.progressPercentage < 100,
	).length;
	const totalHours = Math.round(
		roadmaps.reduce(
			(sum, r) => sum + (r.roadmap.totalEstimatedDuration || 0),
			0,
		) / 60,
	);

	const stats = [
		{
			icon: Map,
			label: 'Total Roadmaps',
			value: roadmaps.length,
			color: theme.palette.primary.light,
		},
		{
			icon: CheckCircle2,
			label: 'Completed',
			value: completed,
			color: theme.palette.success.light,
		},
		{
			icon: TrendingUp,
			label: 'In Progress',
			value: inProgress,
			color: theme.palette.warning.light,
		},
		{
			icon: Clock,
			label: 'Learning Hours',
			value: totalHours,
			color: theme.palette.info.light,
		},
	];

	return (
		<Box sx={styles.container}>
			{stats.map((stat, index) => (
				<StatCard key={stat.label} {...stat} index={index} />
			))}
		</Box>
	);
}
