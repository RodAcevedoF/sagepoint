'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { FileText, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { alpha, type SxProps, type Theme } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import type { DocumentDetailDto } from '@/infrastructure/api/documentApi';

const MotionBox = motion.create(Box);

const makeStyles = (
	theme: Theme,
): {
	container: SxProps<Theme>;
	card: (color: string) => SxProps<Theme>;
	iconContainer: (color: string) => SxProps<Theme>;
	value: (color: string) => SxProps<Theme>;
	label: SxProps<Theme>;
} => ({
	container: {
		display: 'grid',
		gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
		gap: 2.5,
		mb: 5,
	},
	card: (color: string) => ({
		p: 3,
		borderRadius: 4,
		background: alpha(theme.palette.background.paper, 0.4),
		backdropFilter: 'blur(12px)',
		border: `1px solid ${alpha(color, 0.15)}`,
	}),
	iconContainer: (color: string) => ({
		width: 40,
		height: 40,
		borderRadius: 2.5,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		bgcolor: alpha(color, 0.12),
		color,
		mb: 1.5,
	}),
	value: (color: string) => ({
		fontWeight: 700,
		color,
		mb: 0.25,
	}),
	label: {
		color: theme.palette.text.secondary,
	},
});

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

interface DocumentStatsProps {
	documents: DocumentDetailDto[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
	const theme = useTheme();

	const total = documents.length;
	const ready = documents.filter((d) => d.processingStage === 'READY').length;
	const processing = documents.filter(
		(d) => d.status !== 'COMPLETED' && d.status !== 'FAILED',
	).length;
	const withQuizzes = documents.filter(
		(d) => d.processingStage === 'READY' && d.conceptCount && d.conceptCount > 0,
	).length;

	const stats = [
		{
			icon: FileText,
			label: 'Total Documents',
			value: total,
			color: theme.palette.primary.light,
		},
		{
			icon: Loader2,
			label: 'Processing',
			value: processing,
			color: theme.palette.warning.light,
		},
		{
			icon: CheckCircle,
			label: 'Analyzed',
			value: ready,
			color: theme.palette.success.light,
		},
		{
			icon: Brain,
			label: 'With Concepts',
			value: withQuizzes,
			color: theme.palette.info.light,
		},
	];

	return (
		<Box sx={makeStyles(theme).container}>
			{stats.map((stat, index) => (
				<StatCard key={stat.label} {...stat} index={index} />
			))}
		</Box>
	);
}
