'use client';

import { Container, Grid, Typography, Box, useTheme } from '@mui/material';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { useGetProfileQuery } from '@/application/profile/queries/get-profile.query';
import { Loader } from '@/common/components';
import { ProfileHeader } from './ProfileHeader';
import { ProfileDetails } from './ProfileDetails';
import { ProfileLearning } from './ProfileLearning';
import { ProfileActions } from './ProfileActions';
import { makeStyles } from './Profile.styles';

export function ProfilePage() {
	const { user, isLoading } = useGetProfileQuery();
	const theme = useTheme();
	const styles = makeStyles(theme);

	if (isLoading) {
		return (
			<DashboardLayout>
				<Loader variant='page' message='Loading profile' />
			</DashboardLayout>
		);
	}

	if (!user) {
		return (
			<DashboardLayout>
				<Container maxWidth='lg'>
					<Typography variant='h5' color='error'>
						User not found
					</Typography>
				</Container>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<Container maxWidth='lg'>
				<Box sx={styles.pageHeader}>
					<Typography variant='h4' sx={styles.headerTitle}>
						Profile
					</Typography>
					<Typography variant='body1' sx={styles.headerSubtitle}>
						Manage your account settings, preferences and learning journey
					</Typography>
				</Box>

				<Grid container spacing={4}>
					{/* First Row - Admin Profile & Account Details */}
					<Grid size={{ xs: 12, md: 4 }}>
						<ProfileHeader user={user} />
					</Grid>

					<Grid size={{ xs: 12, md: 8 }}>
						<ProfileDetails user={user} />
					</Grid>

					{/* Second Row - Learning Journey Full Width */}
					<Grid size={{ xs: 12 }}>
						<ProfileLearning user={user} />
					</Grid>

					{/* Third Row - Account & Security Full Width */}
					<Grid size={{ xs: 12 }}>
						<ProfileActions />
					</Grid>
				</Grid>
			</Container>
		</DashboardLayout>
	);
}
