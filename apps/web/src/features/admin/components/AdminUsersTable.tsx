'use client';

import { useState } from 'react';
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
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Snackbar,
	Alert,
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
	MoreVertical,
	Ban,
	ShieldCheck,
	ShieldOff,
	UserCheck,
} from 'lucide-react';
import {
	useAdminUsersQuery,
	useUpdateAdminUserMutation,
} from '@/application/admin';
import { Loader, ErrorState } from '@/common/components';

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
		fontSize: '0.85rem',
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

export function AdminUsersTable() {
	const { data: users, isLoading, isError } = useAdminUsersQuery();
	const [updateUser] = useUpdateAdminUserMutation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: 'success' | 'error';
	}>({ open: false, message: '', severity: 'success' });

	const selectedUser = users?.find((u) => u.id === selectedUserId);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		userId: string,
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedUserId(userId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedUserId(null);
	};

	const handleToggleBan = async () => {
		if (!selectedUser) return;
		const action = selectedUser.isActive ? 'ban' : 'unban';
		if (
			!window.confirm(
				`Are you sure you want to ${action} ${selectedUser.name}?`,
			)
		)
			return;
		handleMenuClose();
		try {
			await updateUser({
				id: selectedUser.id,
				data: { isActive: !selectedUser.isActive },
			}).unwrap();
			setSnackbar({
				open: true,
				message: `User ${selectedUser.isActive ? 'banned' : 'unbanned'} successfully`,
				severity: 'success',
			});
		} catch {
			setSnackbar({
				open: true,
				message: `Failed to ${action} user`,
				severity: 'error',
			});
		}
	};

	const handleToggleRole = async () => {
		if (!selectedUser) return;
		const newRole = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
		if (
			!window.confirm(
				`Are you sure you want to change ${selectedUser.name}'s role to ${newRole}?`,
			)
		)
			return;
		handleMenuClose();
		try {
			await updateUser({
				id: selectedUser.id,
				data: { role: newRole },
			}).unwrap();
			setSnackbar({
				open: true,
				message: `Role changed to ${newRole} successfully`,
				severity: 'success',
			});
		} catch {
			setSnackbar({
				open: true,
				message: 'Failed to change role',
				severity: 'error',
			});
		}
	};

	if (isLoading) return <Loader variant='page' message='Loading users' />;
	if (isError || !users)
		return (
			<ErrorState
				title='Failed to load users'
				description='Could not retrieve user data.'
			/>
		);

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<Card
					variant='glass'
					sx={{
						borderTop: `1px solid ${alpha(palette.primary.main, 0.2)}`,
					}}>
					<Card.Header>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<User size={20} color={palette.primary.main} />
							<Typography
								variant='h6'
								sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
								User Directory
							</Typography>
							<Chip
								label={`${users.length} total`}
								size='small'
								sx={{
									ml: 1,
									height: 20,
									fontSize: '0.85rem',
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
										<TableCell sx={styles.headerCell}>
											Auth Detail
										</TableCell>
										<TableCell sx={styles.headerCell}>
											Permission
										</TableCell>
										<TableCell sx={styles.headerCell}>Status</TableCell>
										<TableCell sx={styles.headerCell}>
											Registration
										</TableCell>
										<TableCell sx={styles.headerCell}>Actions</TableCell>
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
																user.role === 'ADMIN'
																	? alpha(palette.error.main, 0.2)
																	: alpha(
																			palette.primary.main,
																			0.2,
																		),
															color:
																user.role === 'ADMIN'
																	? palette.error.light
																	: palette.primary.light,
															border: `1px solid ${alpha(user.role === 'ADMIN' ? palette.error.main : palette.primary.main, 0.2)}`,
														}}>
														{user.name.charAt(0)}
													</Avatar>
													<Box>
														<Typography
															variant='body2'
															sx={{ fontWeight: 700 }}>
															{user.name}
														</Typography>
														<Typography
															variant='caption'
															sx={{
																color: palette.text.secondary,
															}}>
															ID: {user.id.slice(0, 8)}...
														</Typography>
													</Box>
												</Box>
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
													}}>
													<Mail
														size={14}
														color={alpha(
															palette.text.secondary,
															0.4,
														)}
													/>
													<Typography
														variant='body2'
														sx={{
															color: palette.text.secondary,
														}}>
														{user.email}
													</Typography>
												</Box>
											</TableCell>
											<TableCell>
												<Chip
													icon={
														user.role === 'ADMIN' ? (
															<Shield size={12} />
														) : undefined
													}
													label={user.role}
													size='small'
													sx={{
														fontWeight: 700,
														fontSize: '0.8rem',
														letterSpacing: '0.5px',
														borderRadius: '6px',
														bgcolor:
															user.role === 'ADMIN'
																? alpha(
																		palette.error.main,
																		0.1,
																	)
																: alpha(
																		palette.text.secondary,
																		0.1,
																	),
														color:
															user.role === 'ADMIN'
																? palette.error.light
																: palette.text
																		.secondary,
														border: 'none',
													}}
												/>
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
													}}>
													<Chip
														label={
															user.isActive
																? 'Active'
																: 'Banned'
														}
														size='small'
														sx={{
															fontWeight: 700,
															fontSize: '0.8rem',
															borderRadius: '6px',
															bgcolor: user.isActive
																? alpha(
																		palette.success.main,
																		0.1,
																	)
																: alpha(
																		palette.error.main,
																		0.1,
																	),
															color: user.isActive
																? palette.success.light
																: palette.error.light,
															border: 'none',
														}}
													/>
													{user.isVerified && (
														<CheckCircle2
															size={14}
															color={palette.info.main}
														/>
													)}
												</Box>
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
													}}>
													<Calendar
														size={14}
														color={alpha(
															palette.text.secondary,
															0.4,
														)}
													/>
													<Typography
														variant='body2'
														sx={{
															color: palette.text.secondary,
														}}>
														{formatRelativeDate(user.createdAt)}
													</Typography>
												</Box>
											</TableCell>
											<TableCell>
												<IconButton
													size='small'
													onClick={(e) =>
														handleMenuOpen(e, user.id)
													}>
													<MoreVertical size={16} />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Card.Content>
				</Card>
			</motion.div>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				slotProps={{
					paper: {
						sx: {
							bgcolor: palette.background.paper,
							border: `1px solid ${alpha(palette.divider, 0.1)}`,
						},
					},
				}}>
				<MenuItem onClick={handleToggleBan}>
					<ListItemIcon>
						{selectedUser?.isActive ? (
							<Ban size={16} color={palette.error.main} />
						) : (
							<UserCheck size={16} color={palette.success.main} />
						)}
					</ListItemIcon>
					<ListItemText>
						{selectedUser?.isActive ? 'Ban User' : 'Unban User'}
					</ListItemText>
				</MenuItem>
				<MenuItem onClick={handleToggleRole}>
					<ListItemIcon>
						{selectedUser?.role === 'ADMIN' ? (
							<ShieldOff size={16} color={palette.warning.main} />
						) : (
							<ShieldCheck size={16} color={palette.info.main} />
						)}
					</ListItemIcon>
					<ListItemText>
						{selectedUser?.role === 'ADMIN'
							? 'Revoke Admin'
							: 'Make Admin'}
					</ListItemText>
				</MenuItem>
			</Menu>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
				<Alert severity={snackbar.severity} variant='filled'>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
