"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { Shield } from "lucide-react";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { AuroraHero, ErrorState, Loader } from "@/shared/components";
import {
  useAdminStatsQuery,
  useHealthCheckQuery,
  useQueueStatsQuery,
} from "@/application/admin";
import { AdminStatsCards } from "./Cards/AdminStatsCards";
import { AdminSystemHealth } from "./AdminHealth/AdminSystemHealth";
import { AdminQueueStats } from "./AdminQueue/AdminQueueStats";
import { AdminFooter } from "./AdminFooter/AdminFooter";

const stackSx = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
} as const;

export function AdminDashboard() {
  const router = useRouter();
  const user = useCurrentUser();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useAdminStatsQuery();
  const { data: health, isLoading: healthLoading } = useHealthCheckQuery();
  const { data: queueStats, isLoading: queueLoading } = useQueueStatsQuery();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "ADMIN") {
    return <Loader variant="page" message="Checking permissions" />;
  }

  if (statsLoading) {
    return <Loader variant="page" message="Loading admin dashboard" />;
  }

  if (statsError) {
    return (
      <ErrorState
        title="Failed to load admin data"
        description="Could not retrieve admin statistics. Please try again."
      />
    );
  }

  return (
    <Box sx={stackSx}>
      <AuroraHero
        eyebrow="Command Center"
        eyebrowIcon={<Shield size={13} />}
        title="System Management"
        lede="Monitor platform health, manage your user base, and analyze content metrics. Access advanced controls to ensure a smooth learning experience for all users."
        glyph={<Shield size={140} strokeWidth={1} />}
      />

      {stats && <AdminStatsCards stats={stats} />}
      <AdminSystemHealth data={health} isLoading={healthLoading} />
      <AdminQueueStats data={queueStats} isLoading={queueLoading} />
      <AdminFooter />
    </Box>
  );
}
