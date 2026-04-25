"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { Loader, ErrorState } from "@/shared/components";
import {
  useAdminStatsQuery,
  useHealthCheckQuery,
  useQueueStatsQuery,
} from "@/application/admin";
import { AdminStatsCards } from "./Cards/AdminStatsCards";
import { AdminSystemHealth } from "./AdminHealth/AdminSystemHealth";
import { AdminQueueStats } from "./AdminQueue/AdminQueueStats";
import { AdminHero } from "./AdminHero/AdminHero";
import { AdminFooter } from "./AdminFooter/AdminFooter";

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

  // Redirect non-admins
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
    <Box>
      <AdminHero />

      {stats && <AdminStatsCards stats={stats} />}
      <AdminSystemHealth data={health} isLoading={healthLoading} />
      <AdminQueueStats data={queueStats} isLoading={queueLoading} />

      <AdminFooter />
    </Box>
  );
}
