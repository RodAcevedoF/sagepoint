'use client';

import { useState } from 'react';
import { Box, Typography, Grid, alpha, Chip, Collapse, CircularProgress } from '@mui/material';
import { FileText, Map, Clock, Play, CheckCircle2, XCircle, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import { motion } from 'framer-motion';
import type { QueueStatsResponse, QueueInfo } from '@/infrastructure/api/adminApi';

const styles = {
	card: {
		p: 3,
		height: '100%',
	},
	sectionTitle: {
		fontWeight: 800,
		fontSize: '1.1rem',
		mb: 2.5,
		color: palette.text.primary,
	},
	queueName: {
		fontWeight: 700,
		fontSize: '0.95rem',
		mb: 1.5,
	},
	countRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		mb: 0.75,
	},
	countLabel: {
		fontSize: '0.8rem',
		color: palette.text.secondary,
		flex: 1,
	},
	failureItem: {
		p: 1.5,
		borderRadius: 1,
		bgcolor: alpha(palette.error.main, 0.08),
		border: `1px solid ${alpha(palette.error.main, 0.15)}`,
		mb: 1,
	},
	failureReason: {
		fontSize: '0.75rem',
		color: palette.error.light,
		wordBreak: 'break-word',
	},
};

const countConfigs = [
	{ key: 'waiting' as const, label: 'Waiting', icon: Clock, color: palette.warning.main },
	{ key: 'active' as const, label: 'Active', icon: Play, color: palette.info.main },
	{ key: 'completed' as const, label: 'Completed', icon: CheckCircle2, color: palette.success.main },
	{ key: 'failed' as const, label: 'Failed', icon: XCircle, color: palette.error.main },
	{ key: 'delayed' as const, label: 'Delayed', icon: Timer, color: palette.text.secondary },
];

const queues = [
	{ key: 'documentQueue' as const, label: 'Document Processing', icon: FileText, color: palette.secondary.light },
	{ key: 'roadmapQueue' as const, label: 'Roadmap Generation', icon: Map, color: palette.primary.main },
];

interface AdminQueueStatsProps {
	data: QueueStatsResponse | undefined;
	isLoading: boolean;
}

function QueueCard({ queue, icon: Icon, label, color, index }: {
	queue: QueueInfo | undefined;
	icon: typeof FileText;
	label: string;
	color: string;
	index: number;
}) {
	const [expanded, setExpanded] = useState(false);
	const failures = queue?.recentFailures ?? [];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}>
			<Card variant='glass' hoverable={true} sx={styles.card}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 3,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: alpha(color, 0.12),
							color: color,
							border: `1px solid ${alpha(color, 0.2)}`,
						}}>
						<Icon size={24} />
					</Box>
					<Typography sx={styles.queueName}>{label}</Typography>
				</Box>

				{!queue ? (
					<Typography sx={{ fontSize: '0.8rem', color: palette.text.secondary }}>
						No data available
					</Typography>
				) : (
					<>
						{countConfigs.map((config) => {
							const CountIcon = config.icon;
							const value = queue.counts[config.key] ?? 0;
							return (
								<Box key={config.key} sx={styles.countRow}>
									<CountIcon size={14} color={config.color} />
									<Typography sx={styles.countLabel}>{config.label}</Typography>
									<Chip
										label={value}
										size='small'
										sx={{
											height: 22,
											fontSize: '0.75rem',
											fontWeight: 700,
											bgcolor: alpha(config.color, 0.12),
											color: config.color,
											border: `1px solid ${alpha(config.color, 0.2)}`,
										}}
									/>
								</Box>
							);
						})}

						{failures.length > 0 && (
							<Box sx={{ mt: 1.5 }}>
								<Box
									onClick={() => setExpanded(!expanded)}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 0.5,
										cursor: 'pointer',
										color: palette.error.light,
										fontSize: '0.8rem',
										fontWeight: 600,
										'&:hover': { opacity: 0.8 },
									}}>
									Recent Failures ({failures.length})
									{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
								</Box>
								<Collapse in={expanded}>
									<Box sx={{ mt: 1 }}>
										{failures.map((failure, i) => (
											<Box key={failure.id ?? i} sx={styles.failureItem}>
												<Typography sx={styles.failureReason}>
													{failure.failedReason || 'Unknown error'}
												</Typography>
											</Box>
										))}
									</Box>
								</Collapse>
							</Box>
						)}
					</>
				)}
			</Card>
		</motion.div>
	);
}

export function AdminQueueStats({ data, isLoading }: AdminQueueStatsProps) {
	return (
		<Box sx={{ mb: 5 }}>
			<Typography sx={styles.sectionTitle}>Queue Monitor</Typography>
			{isLoading && !data ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress size={24} />
				</Box>
			) : (
				<Grid container spacing={2.5}>
					{queues.map((q, index) => (
						<Grid key={q.key} size={{ xs: 12, sm: 6 }}>
							<QueueCard
								queue={data?.[q.key]}
								icon={q.icon}
								label={q.label}
								color={q.color}
								index={index}
							/>
						</Grid>
					))}
				</Grid>
			)}
		</Box>
	);
}
