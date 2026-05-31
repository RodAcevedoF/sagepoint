"use client";

import { Users, FileText, Map, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard, StatGrid, type AuroraTone } from "@/shared/components";
import type { AdminStatsDto } from "@/infrastructure/api/adminApi";

type NumericStatKey = {
  [K in keyof AdminStatsDto]: AdminStatsDto[K] extends number ? K : never;
}[keyof AdminStatsDto];

interface StatConfig {
  key: NumericStatKey;
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const statConfigs: ReadonlyArray<StatConfig> = [
  { key: "userCount", label: "Users", icon: Users, tone: "concept" },
  { key: "documentCount", label: "Docs", icon: FileText, tone: "ready" },
  { key: "roadmapCount", label: "Paths", icon: Map, tone: "teal" },
  { key: "quizCount", label: "Tests", icon: Brain, tone: "proc" },
];

interface AdminStatsCardsProps {
  stats: AdminStatsDto;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <StatGrid>
      {statConfigs.map((config) => {
        const Icon = config.icon;
        return (
          <StatCard
            key={config.key}
            icon={<Icon size={22} />}
            value={stats[config.key]}
            label={config.label}
            tone={config.tone}
          />
        );
      })}
    </StatGrid>
  );
}
