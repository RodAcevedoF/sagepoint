"use client";

import { Container, Grid, Typography, Box } from "@mui/material";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { useGetProfileQuery } from "@/application/profile/queries/get-profile.query";
import { Loader } from "@/common/components";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileDetails } from "./ProfileDetails";
import { ProfileLearning } from "./ProfileLearning";
import { ProfileActions } from "./ProfileActions";

export function ProfilePage() {
  const { user, isLoading } = useGetProfileQuery();

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
        <Container maxWidth="lg">
          <Typography variant="h5" color="error">
            User not found
          </Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Profile Header & Details */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ProfileHeader user={user} />
          </Grid>

          {/* Right Column - Learning & Actions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ProfileDetails user={user} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProfileLearning user={user} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProfileActions />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
