'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Typography,
	Avatar,
	Box,
	alpha,
} from '@mui/material';
import { Card } from '@/common/components';
import { palette } from '@/common/theme';
import { motion } from 'framer-motion';
import {
	User,
	Shield,
	Mail,
	Calendar,
	CheckCircle2,
	Clock,
} from 'lucide-react';
import type { AdminUserDto } from '@/infrastructure/api/adminApi';

function formatRelativeDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	};
	return date.toLocaleDateString(undefined, options);
}

const styles = {
	headerCell: {
		color: palette.text.secondary,
		fontWeight: 700,
		fontSize: '0.75rem',
		textTransform: 'uppercase',
		letterSpacing: '1px',
		py: 2,
		borderBottom: `1px solid ${alpha(palette.divider, 0.1)}`,
	},
	row: {
		'&:hover': {
			bgcolor: alpha(palette.primary.main, 0.04),
		},
		transition: 'background-color 0.2s ease',
	},
	nameWrapper: {
		display: 'flex',
		alignItems: 'center',
		gap: 1.5,
	},
};

interface AdminUsersTableProps {
	users: AdminUserDto[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.4 }}>
			<Card
				variant='glass'
				sx={{ borderTop: `1px solid ${alpha(palette.primary.main, 0.2)}` }}>
				<Card.Header>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<User size={20} color={palette.primary.main} />
						<Typography
							variant='h6'
							sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
							User Directory
						</Typography>
						<Chip
							label={`${users.length} active`}
							size='small'
							sx={{
								ml: 1,
								height: 20,
								fontSize: '0.7rem',
								fontWeight: 700,
								bgcolor: alpha(palette.success.main, 0.1),
								color: palette.success.light,
								border: 'none',
							}}
						/>
					</Box>
				</Card.Header>
				<Card.Content sx={{ p: 0 }}>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell sx={styles.headerCell}>Identity</TableCell>
									<TableCell sx={styles.headerCell}>Auth Detail</TableCell>
									<TableCell sx={styles.headerCell}>Permission</TableCell>
									<TableCell sx={styles.headerCell}>Registration</TableCell>
									<TableCell sx={styles.headerCell}>Lifecycle</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id} sx={styles.row}>
										<TableCell>
											<Box sx={styles.nameWrapper}>
												<Avatar
													sx={{
														width: 36,
														height: 36,
														fontSize: '0.875rem',
														fontWeight: 700,
														bgcolor:
															user.role === 'ADMIN' ?
																alpha(palette.error.main, 0.2)
															:	alpha(palette.primary.main, 0.2),
														color:
															user.role === 'ADMIN' ?
																palette.error.light
															:	palette.primary.light,
														border: `1px solid ${alpha(user.role === 'ADMIN' ? palette.error.main : palette.primary.main, 0.2)}`,
													}}>
													{user.name.charAt(0)}
												</Avatar>
												<Box>
													<Typography variant='body2' sx={{ fontWeight: 700 }}>
														{user.name}
													</Typography>
													<Typography
														variant='caption'
														sx={{ color: palette.text.secondary }}>
														ID: {user.id.slice(0, 8)}...
													</Typography>
												</Box>
											</Box>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Mail
													size={14}
													color={alpha(palette.text.secondary, 0.4)}
												/>
												<Typography
													variant='body2'
													sx={{ color: palette.text.secondary }}>
													{user.email}
												</Typography>
											</Box>
										</TableCell>
										<TableCell>
											<Chip
												icon={
													user.role === 'ADMIN' ?
														<Shield size={12} />
													:	undefined
												}
												label={user.role}
												size='small'
												sx={{
													fontWeight: 700,
													fontSize: '0.65rem',
													letterSpacing: '0.5px',
													borderRadius: '6px',
													bgcolor:
														user.role === 'ADMIN' ?
															alpha(palette.error.main, 0.1)
														:	alpha(palette.text.secondary, 0.1),
													color:
														user.role === 'ADMIN' ?
															palette.error.light
														:	palette.text.secondary,
													border: 'none',
												}}
											/>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Calendar
													size={14}
													color={alpha(palette.text.secondary, 0.4)}
												/>
												<Typography
													variant='body2'
													sx={{ color: palette.text.secondary }}>
													{formatRelativeDate(user.createdAt)}
												</Typography>
											</Box>
										</TableCell>
										<TableCell>
											<Box
												sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												{user.onboardingStatus === 'COMPLETED' ?
													<CheckCircle2
														size={14}
														color={palette.success.main}
													/>
												:	<Clock size={14} color={palette.warning.main} />}
												<Typography
													variant='caption'
													sx={{
														fontWeight: 700,
														color:
															user.onboardingStatus === 'COMPLETED' ?
																palette.success.light
															:	palette.warning.light,
													}}>
													{user.onboardingStatus}
												</Typography>
											</Box>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Card.Content>
			</Card>
		</motion.div>
	);
}
