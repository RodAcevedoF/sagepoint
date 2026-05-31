"use client";

import { Box } from "@mui/material";
import { Trophy, Map, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { toneColor, type AuroraTone } from "@/shared/components";
import type { UserMetrics } from "../types/dashboard.types";

interface DashboardGreetingProps {
  userName: string;
  metrics: Pick<
    UserMetrics,
    "completedRoadmaps" | "activeRoadmaps" | "totalStepsCompleted"
  >;
}

interface StatConfig {
  key: keyof DashboardGreetingProps["metrics"];
  label: string;
  icon: LucideIcon;
  tone: AuroraTone;
}

const statConfigs: ReadonlyArray<StatConfig> = [
  { key: "completedRoadmaps", label: "Completed", icon: Trophy, tone: "proc" },
  { key: "activeRoadmaps", label: "Active paths", icon: Map, tone: "ready" },
  {
    key: "totalStepsCompleted",
    label: "Steps",
    icon: CheckCircle,
    tone: "concept",
  },
];

function formatToday(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} · ${month} ${now.getDate()}`;
}

const sectionSx = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "24px",
  border: `1px solid ${aurora.line}`,
  padding: { xs: "26px 22px", md: "32px 36px" },
  background: `radial-gradient(520px 300px at 90% 10%, oklch(0.42 0.10 195 / 0.14), transparent 70%), linear-gradient(160deg, oklch(0.235 0.03 250 / 0.7), oklch(0.16 0.03 264 / 0.6))`,
  boxShadow: aurora.shadow.card,
  display: "flex",
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: { xs: "20px", md: "24px" },
  flexWrap: "wrap",
} as const;

const eyebrowSx = {
  fontFamily: aurora.font.mono,
  fontSize: "11.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: aurora.teal,
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 800,
  fontSize: "clamp(28px, 3.6vw, 44px)",
  letterSpacing: "-0.025em",
  margin: "10px 0 0",
  color: aurora.txHi,
  lineHeight: 1.08,
} as const;

const ledeSx = {
  margin: "10px 0 0",
  fontSize: "15.5px",
  color: aurora.txMid,
  lineHeight: 1.55,
  maxWidth: "52ch",
} as const;

const statsRowSx = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  width: { xs: "100%", md: "auto" },
} as const;

const statCellSx = (color: string) =>
  ({
    flex: { xs: "1 1 100px", md: "0 0 auto" },
    minWidth: { xs: 0, md: 116 },
    padding: { xs: "12px 14px", md: "16px 18px" },
    borderRadius: aurora.radii.md,
    border: `1px solid ${aurora.line}`,
    background: "oklch(0.255 0.024 262 / 0.6)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "border-color .15s",
    "&:hover": { borderColor: auroraTint(color, 0.4) },
  }) as const;

const statTopSx = (color: string) =>
  ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: aurora.font.mono,
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: aurora.txLow,
    fontWeight: 600,
    "& svg": { color },
  }) as const;

const statNumSx = {
  fontFamily: aurora.font.display,
  fontWeight: 800,
  fontSize: { xs: "26px", md: "30px" },
  color: aurora.txHi,
  marginTop: "4px",
  letterSpacing: "-0.02em",
  lineHeight: 1,
} as const;

export function DashboardGreeting({
  userName,
  metrics,
}: DashboardGreetingProps) {
  const firstName = userName.split(" ")[0];
  const lede =
    metrics.totalStepsCompleted > 0
      ? `You've completed ${metrics.totalStepsCompleted} step${metrics.totalStepsCompleted === 1 ? "" : "s"} so far. Pick up a roadmap or analyze a new document.`
      : "Ready to continue your learning journey? Pick up a roadmap or analyze a new document.";

  return (
    <Box component="section" sx={sectionSx}>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={eyebrowSx}>{formatToday()}</Box>
        <Box component="h1" sx={titleSx}>
          Welcome back, {firstName}
        </Box>
        <Box component="p" sx={ledeSx}>
          {lede}
        </Box>
      </Box>
      <Box sx={statsRowSx}>
        {statConfigs.map((config) => {
          const Icon = config.icon;
          const color = toneColor(config.tone);
          return (
            <Box key={config.key} sx={statCellSx(color)}>
              <Box sx={statTopSx(color)}>
                <Icon size={14} /> {config.label}
              </Box>
              <Box sx={statNumSx}>{metrics[config.key]}</Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
