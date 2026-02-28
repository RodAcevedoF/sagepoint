'use client';

import { Box, Typography, Grid, alpha, CircularProgress } from '@mui/material';
import { Database, Server, GitBranch, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import { motion } from 'framer-motion';
import type { HealthCheckResult } from '@/infrastructure/api/adminApi';

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
	serviceName: {
		fontWeight: 700,
		fontSize: '0.95rem',
	},
	statusText: {
		fontSize: '0.75rem',
		fontWeight: 600,
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
	},
};

const services = [
	{ key: 'database', label: 'PostgreSQL', icon: Database, color: palette.info.main },
	{ key: 'redis', label: 'Redis', icon: Server, color: palette.error.light },
	{ key: 'neo4j', label: 'Neo4j', icon: GitBranch, color: palette.success.main },
];

interface AdminSystemHealthProps {
	data: HealthCheckResult | undefined;
	isLoading: boolean;
}

export function AdminSystemHealth({ data, isLoading }: AdminSystemHealthProps) {
	return (
		<Box sx={{ mb: 5 }}>
			<Typography sx={styles.sectionTitle}>System Health</Typography>
			<Grid container spacing={2.5}>
				{services.map((service, index) => {
					const Icon = service.icon;
					const detail = data?.details?.[service.key];
					const isUp = detail?.status === 'up';
					const statusColor = isUp ? palette.success.main : palette.error.main;

					return (
						<Grid key={service.key} size={{ xs: 12, sm: 4 }}>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}>
								<Card variant='glass' hoverable={true} sx={styles.card}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										<Box
											sx={{
												width: 48,
												height: 48,
												borderRadius: 3,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												bgcolor: alpha(service.color, 0.12),
												color: service.color,
												border: `1px solid ${alpha(service.color, 0.2)}`,
											}}>
											<Icon size={24} />
										</Box>
										<Box sx={{ flex: 1 }}>
											<Typography sx={styles.serviceName}>
												{service.label}
											</Typography>
											{isLoading ? (
												<CircularProgress size={14} sx={{ mt: 0.5 }} />
											) : (
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
													{data ? (
														<>
															{isUp ? (
																<CheckCircle2 size={14} color={statusColor} />
															) : (
																<XCircle size={14} color={statusColor} />
															)}
															<Typography sx={{ ...styles.statusText, color: statusColor }}>
																{isUp ? 'Healthy' : 'Down'}
															</Typography>
														</>
													) : (
														<Typography sx={{ ...styles.statusText, color: palette.text.secondary }}>
															Unknown
														</Typography>
													)}
												</Box>
											)}
										</Box>
									</Box>
								</Card>
							</motion.div>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
}
