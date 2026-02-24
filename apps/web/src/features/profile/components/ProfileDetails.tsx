'use client';

import { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Stack,
	alpha,
	IconButton,
	useTheme,
} from '@mui/material';
import { User, Mail, Pencil, X, Check, Settings } from 'lucide-react';
import { Card, useSnackbar } from '@/common/components';
import { UserDto } from '@/infrastructure/api/authApi';
import { useUpdateProfileCommand } from '@/application/profile/commands/update-profile.command';
import { makeStyles } from './Profile.styles';

interface ProfileDetailsProps {
	user: UserDto;
}

interface DetailRowProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	editable?: boolean;
	onSave?: (value: string) => Promise<void>;
	color?: string;
}

function DetailRow({
	icon,
	label,
	value,
	editable,
	onSave,
	color,
}: DetailRowProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);
	const [isSaving, setIsSaving] = useState(false);
	const theme = useTheme();
	const styles = makeStyles(theme);

	const handleSave = async () => {
		if (!onSave || editValue === value) {
			setIsEditing(false);
			return;
		}
		setIsSaving(true);
		try {
			await onSave(editValue);
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditValue(value);
		setIsEditing(false);
	};

	return (
		<Box sx={styles.detailRow}>
			<Box sx={styles.iconBox(color || theme.palette.primary.light)}>
				{icon}
			</Box>

			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					variant='caption'
					sx={{
						fontWeight: 600,
						color: theme.palette.text.secondary,
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
					}}>
					{label}
				</Typography>
				{isEditing ?
					<TextField
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						size='small'
						fullWidth
						autoFocus
						sx={{ mt: 1 }}
					/>
				:	<Typography
						variant='body1'
						sx={{ fontWeight: 600, mt: 0.25, wordBreak: 'break-word' }}>
						{value}
					</Typography>
				}
			</Box>

			{editable && (
				<Box sx={{ flexShrink: 0, alignSelf: 'center' }}>
					{isEditing ?
						<Stack direction='row' spacing={1}>
							<IconButton
								size='small'
								onClick={handleSave}
								disabled={isSaving}
								sx={{
									color: theme.palette.success.light,
									bgcolor: alpha(theme.palette.success.main, 0.1),
								}}>
								<Check size={18} />
							</IconButton>
							<IconButton
								size='small'
								onClick={handleCancel}
								sx={{
									color: theme.palette.error.light,
									bgcolor: alpha(theme.palette.error.main, 0.1),
								}}>
								<X size={18} />
							</IconButton>
						</Stack>
					:	<IconButton
							size='small'
							onClick={() => setIsEditing(true)}
							sx={{
								color: theme.palette.primary.light,
								bgcolor: alpha(theme.palette.primary.main, 0.1),
							}}>
							<Pencil size={18} />
						</IconButton>
					}
				</Box>
			)}
		</Box>
	);
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
	const { execute: updateProfile } = useUpdateProfileCommand();
	const { showSnackbar } = useSnackbar();
	const theme = useTheme();
	const styles = makeStyles(theme);

	const handleUpdateName = async (name: string) => {
		try {
			await updateProfile({ name });
			showSnackbar('Name updated successfully', { severity: 'success' });
		} catch {
			showSnackbar('Failed to update name', { severity: 'error' });
			throw new Error('Failed to update');
		}
	};

	return (
		<Card variant='glass' sx={styles.profileCard} hoverable={false}>
			<Card.Content sx={{ p: { xs: 2.5, md: 4 } }}>
				<Typography variant='h6' sx={styles.sectionTitle}>
					<Settings size={20} />
					Account Details
				</Typography>

				<Stack spacing={0.5} sx={{ mt: 2 }}>
					<DetailRow
						icon={<User size={20} />}
						label='Full Name'
						value={user.name}
						editable
						onSave={handleUpdateName}
					/>
					<DetailRow
						icon={<Mail size={20} />}
						label='Email Address'
						value={user.email}
						color={theme.palette.info.light}
					/>
				</Stack>
			</Card.Content>
		</Card>
	);
}
