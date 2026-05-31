"use client";

import { Map, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import { StatCard, StatGrid } from "@/shared/components";
import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";

interface RoadmapStatsProps {
  roadmaps: UserRoadmapDto[];
}

export function RoadmapStats({ roadmaps }: RoadmapStatsProps) {
  const completed = roadmaps.filter(
    (r) => r.progress.progressPercentage === 100,
  ).length;
  const inProgress = roadmaps.filter(
    (r) =>
      r.progress.inProgressSteps > 0 && r.progress.progressPercentage < 100,
  ).length;
  const totalHours = Math.round(
    roadmaps.reduce(
      (sum, r) => sum + (r.roadmap.totalEstimatedDuration || 0),
      0,
    ) / 60,
  );

  return (
    <StatGrid style={{ marginTop: 28, marginBottom: 28 }}>
      <StatCard
        icon={<Map size={20} />}
        value={roadmaps.length}
        label="Total Roadmaps"
        tone="teal"
      />
      <StatCard
        icon={<CheckCircle2 size={20} />}
        value={completed}
        label="Completed"
        tone="ready"
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        value={inProgress}
        label="In Progress"
        tone="proc"
      />
      <StatCard
        icon={<Clock size={20} />}
        value={totalHours}
        label="Learning Hours"
        tone="concept"
      />
    </StatGrid>
  );
}
