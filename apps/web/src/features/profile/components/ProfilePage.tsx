"use client";

import { Grid, Typography } from "@mui/material";
import { UserCircle2 } from "lucide-react";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { useGetProfileQuery } from "@/application/profile/queries/get-profile.query";
import { AuroraHero, Loader } from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileDetails } from "./ProfileDetails";
import { ProfileLearning } from "./ProfileLearning";
import { ProfileInterests } from "./ProfileInterests";
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
        <Typography variant="h5" sx={{ color: auroraPalette.status.fail }}>
          User not found
        </Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout width="lg">
      <AuroraHero
        eyebrow="Account"
        eyebrowIcon={<UserCircle2 size={13} />}
        title="Your Profile"
        lede="Manage your account settings, preferences and learning journey."
        glyph={<UserCircle2 size={140} strokeWidth={1.2} />}
      />

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
