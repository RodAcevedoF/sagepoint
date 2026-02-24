'use client';

import { Avatar, Box, Typography, alpha, Chip, useTheme } from '@mui/material';
import { Camera, Shield, CheckCircle, Verified } from 'lucide-react';
import { Card } from '@/common/components';
import { UserDto } from '@/infrastructure/api/authApi';
import { makeStyles } from './Profile.styles';

interface ProfileHeaderProps {
	user: UserDto;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
	const theme = useTheme();
	const styles = makeStyles(theme);

	const initials = user.name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	const isAdmin = user.role === 'ADMIN';

	return (
		<Card variant='glass' sx={styles.profileCard} hoverable={false}>
			<Card.Content sx={{ textAlign: 'center', py: 5, px: 3 }}>
				{/* Avatar with edit overlay */}
				<Box sx={styles.avatarWrapper}>
					<Avatar src={user.avatarUrl} sx={styles.avatar}>
						{initials}
					</Avatar>

					{/* Edit overlay */}
					<Box
						className='avatar-overlay'
						sx={styles.avatarOverlay}
						component='label'>
						<Camera size={32} color={theme.palette.primary.light} />
						<input hidden accept='image/*' type='file' />
					</Box>
				</Box>

				{/* Name & Email */}
				<Box sx={{ mb: 3 }}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 1,
							mb: 0.5,
						}}>
						<Typography variant='h5' sx={{ fontWeight: 700 }}>
							{user.name}
						</Typography>
						<Verified size={18} color={theme.palette.primary.light} />
					</Box>
					<Typography
						variant='body2'
						color='text.secondary'
						sx={{ wordBreak: 'break-word' }}>
						{user.email}
					</Typography>
				</Box>

				{/* Role Badge */}
				<Chip
					icon={isAdmin ? <Shield size={14} /> : <CheckCircle size={14} />}
					label={isAdmin ? 'Administrator' : 'Member'}
					size='small'
					sx={{
						py: 2,
						px: 1,
						borderRadius: 2,
						bgcolor: alpha(
							isAdmin ? theme.palette.warning.main : theme.palette.primary.main,
							0.1,
						),
						color:
							isAdmin ?
								theme.palette.warning.light
							:	theme.palette.primary.light,
						fontWeight: 700,
						fontSize: '0.75rem',
						textTransform: 'uppercase',
						letterSpacing: '0.05em',
						'& .MuiChip-icon': {
							color: 'inherit',
						},
						border: `1px solid ${alpha(isAdmin ? theme.palette.warning.main : theme.palette.primary.main, 0.2)}`,
					}}
				/>
			</Card.Content>
		</Card>
	);
}
