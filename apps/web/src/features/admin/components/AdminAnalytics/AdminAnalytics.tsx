"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import {
  AuroraTabs,
  EmptyState,
  ErrorState,
  Loader,
  type AuroraTabItem,
} from "@/shared/components";
import { BarChart3, Users, FileText, Map, DollarSign } from "lucide-react";
import { useAdminAnalyticsQuery } from "@/application/admin";
import { aurora } from "@/shared/theme";
import { AnalyticsChartCard } from "../Cards/AnalyticsChartCard";
import { adminTableStyles } from "../AdminRoadmaps/adminTable.styles";

type Period = "7d" | "30d" | "90d";

const PERIOD_TABS: ReadonlyArray<AuroraTabItem<Period>> = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
];

const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function addLabels(points: { date: string; count: number }[]) {
  return points.map((p) => ({ ...p, label: formatDateLabel(p.date) }));
}

const headerRowSx = {
  display: "flex",
  alignItems: { xs: "flex-start", md: "center" },
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "20px",
  flexWrap: "wrap" as const,
} as const;

const chartGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: "18px",
} as const;

const placeholderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 220,
} as const;

export function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const days = PERIOD_DAYS[period];
  const { data, isLoading, isError } = useAdminAnalyticsQuery({ days });

  if (isLoading) return <Loader variant="page" message="Loading analytics" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load analytics"
        description="Could not retrieve analytics data."
      />
    );

  const signups = addLabels(data?.signups ?? []);
  const uploads = addLabels(data?.uploads ?? []);
  const generations = addLabels(data?.generations ?? []);

  return (
    <Box>
      <Box sx={headerRowSx}>
        <Box sx={adminTableStyles.panelTitle}>
          <Box sx={adminTableStyles.panelTitleIcon}>
            <BarChart3 size={20} />
          </Box>
          <Box component="h2" sx={adminTableStyles.panelHeading}>
            Analytics
          </Box>
        </Box>
        <AuroraTabs<Period>
          items={PERIOD_TABS}
          activeId={period}
          onChange={setPeriod}
        />
      </Box>

      <Box sx={chartGridSx}>
        <AnalyticsChartCard
          icon={<Users size={18} />}
          title="User Growth"
          data={signups}
          color={aurora.status.concept}
          variant="area"
          gradientId="signupGrad"
        />
        <AnalyticsChartCard
          icon={<FileText size={18} />}
          title="Document Uploads"
          data={uploads}
          color={aurora.status.ready}
          variant="bar"
        />
        <AnalyticsChartCard
          icon={<Map size={18} />}
          title="Roadmap Generations"
          data={generations}
          color={aurora.teal}
          variant="line"
        />
        <AnalyticsChartCard
          icon={<DollarSign size={18} />}
          title="AI Costs"
          data={[]}
          color={aurora.status.proc}
          variant="bar"
          placeholder={
            <Box sx={placeholderSx}>
              <EmptyState
                title="Coming Soon"
                description="AI cost tracking will be available in a future release."
              />
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
