"use client";

import { Box, CircularProgress } from "@mui/material";
import { Database, Server, GitBranch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  SecTitle,
  StatusPill,
  type AuroraTone,
} from "@/shared/components";
import { aurora } from "@/shared/theme";
import type { HealthCheckResult } from "@/infrastructure/api/adminApi";

interface ServiceConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const services: ReadonlyArray<ServiceConfig> = [
  { key: "database", label: "PostgreSQL", icon: Database, tone: "concept" },
  { key: "redis", label: "Redis", icon: Server, tone: "fail" },
  { key: "neo4j", label: "Neo4j", icon: GitBranch, tone: "ready" },
];

const gridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
  gap: "18px",
} as const;

const cardSx = {
  padding: "22px 24px",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
} as const;

const iconBoxSx = {
  flex: "none",
  width: 54,
  height: 54,
  borderRadius: aurora.radii.md,
  display: "grid",
  placeItems: "center",
  background: `color-mix(in oklch, var(--accent) 16%, ${aurora.surface2})`,
  border: "1px solid color-mix(in oklch, var(--accent) 28%, transparent)",
  color: "var(--accent)",
  boxShadow:
    "0 0 24px -8px color-mix(in oklch, var(--accent) 70%, transparent)",
} as const;

const nameSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "20px",
  color: aurora.txHi,
  letterSpacing: "-0.01em",
} as const;

interface AdminSystemHealthProps {
  data: HealthCheckResult | undefined;
  isLoading: boolean;
}

function resolveStatus(
  data: HealthCheckResult | undefined,
  serviceKey: string,
  isLoading: boolean,
): { label: string; tone: AuroraTone } {
  if (isLoading && !data) return { label: "Checking", tone: "teal" };
  const detail = data?.details?.[serviceKey];
  if (!detail) return { label: "Unknown", tone: "teal" };
  return detail.status === "up"
    ? { label: "Healthy", tone: "ready" }
    : { label: "Down", tone: "fail" };
}

export function AdminSystemHealth({ data, isLoading }: AdminSystemHealthProps) {
  return (
    <Box>
      <SecTitle style={{ marginBottom: "14px" }}>System Health</SecTitle>
      <Box sx={gridSx}>
        {services.map((service) => {
          const Icon = service.icon;
          const status = resolveStatus(data, service.key, isLoading);
          return (
            <Card
              key={service.key}
              variant="aurora"
              tone={service.tone}
              hoverable={false}
              withAura={false}
              sx={cardSx}
            >
              <Box sx={iconBoxSx}>
                <Icon size={26} />
              </Box>
              <Box>
                <Box sx={nameSx}>{service.label}</Box>
                <Box sx={{ marginTop: "6px" }}>
                  {isLoading && !data ? (
                    <CircularProgress size={14} sx={{ color: aurora.teal }} />
                  ) : (
                    <StatusPill label={status.label} tone={status.tone} />
                  )}
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
