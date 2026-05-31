"use client";

import { Box, Grid, Typography, useTheme } from "@mui/material";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { useGetProfileQuery } from "@/application/profile/queries/get-profile.query";
import { Loader } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileDetails } from "./ProfileDetails";
import { ProfileLearning } from "./ProfileLearning";
import { ProfileInterests } from "./ProfileInterests";
import { ProfileActions } from "./ProfileActions";
import { makeStyles } from "./Profile.styles";

export function ProfilePage() {
  const { user, isLoading } = useGetProfileQuery();
  const theme = useTheme();
  const styles = makeStyles(theme);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader variant="page" message="Loading profile" />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Typography variant="h5" sx={{ color: auroraPalette.status.fail }}>
          User not found
        </Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout width="lg">
      <Box sx={styles.pageHeader}>
        <Typography component="h1" sx={styles.headerTitle}>
          Profile
        </Typography>
        <Typography component="p" sx={styles.headerSubtitle}>
          Manage your account settings, preferences and learning journey
        </Typography>
      </Box>

      <Grid container spacing="22px" sx={{ pb: 8 }}>
        {/* Row 1 — Identity (380px) | Account Details (1fr) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileHeader user={user} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileDetails user={user} />
        </Grid>

        {/* Row 2 — Learning Journey | Interests (1fr 1fr) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileLearning user={user} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileInterests user={user} />
        </Grid>

        {/* Row 3 — Account & Security (full width) */}
        <Grid size={{ xs: 12 }}>
          <ProfileActions />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
