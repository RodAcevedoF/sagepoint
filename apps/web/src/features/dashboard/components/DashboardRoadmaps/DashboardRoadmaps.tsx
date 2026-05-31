"use client";

import { useRouter } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { Flame, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import { RoadmapCard } from "../RoadmapCard";
import { OverviewChip } from "./OverviewChip";
import { CategoriesPanel } from "./CategoriesPanel";
import type {
  RoadmapItem,
  RoadmapsOverview,
  DashboardRoadmap,
} from "../../types/dashboard.types";
import { computeCategoriesOverview } from "../../utils/dashboard.utils";

interface DashboardRoadmapsProps {
  roadmaps: RoadmapItem[];
  overview: RoadmapsOverview;
  allRoadmaps: DashboardRoadmap[];
  onRoadmapComplete?: () => void;
}

const cardSx = {
  p: { xs: 2.5, md: "28px 30px 30px" },
} as const;

const headerSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: "20px",
  gap: "14px",
} as const;

const titleSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "22px",
  color: aurora.txHi,
  letterSpacing: "-0.015em",
  m: 0,
} as const;

const viewAllSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "14px",
  fontWeight: 600,
  color: aurora.status.concept,
  cursor: "pointer",
  whiteSpace: "nowrap",
  "&:hover": { color: auroraTint(aurora.status.concept, 0.85) },
} as const;

export function DashboardRoadmaps({
  roadmaps,
  overview,
  allRoadmaps,
  onRoadmapComplete,
}: DashboardRoadmapsProps) {
  const router = useRouter();
  const categories = computeCategoriesOverview(allRoadmaps);

  return (
    <Card variant="aurora" hoverable={false} withAura={false} sx={cardSx}>
      <Box sx={headerSx}>
        <Typography component="h2" sx={titleSx}>
          Your Roadmaps
        </Typography>
        <Box sx={viewAllSx} onClick={() => router.push("/roadmaps")}>
          View all <ArrowRight size={15} />
        </Box>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
        <OverviewChip
          count={overview.inProgress}
          label="in progress"
          icon={<Flame size={13} strokeWidth={2.4} />}
          tone="proc"
        />
        <OverviewChip
          count={overview.completed}
          label="completed"
          icon={<Trophy size={13} strokeWidth={2.4} />}
          tone="ready"
        />
        <OverviewChip
          count={overview.justCreated}
          label="just created"
          icon={<Sparkles size={13} strokeWidth={2.4} />}
          tone="concept"
        />
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={2.5}
        alignItems="stretch"
      >
        <Box sx={{ flex: { md: 2 }, minWidth: 0 }}>
          <Stack spacing={1.5}>
            {roadmaps.map((item, index) => (
              <RoadmapCard
                key={item.id}
                item={item}
                index={index}
                onClick={(id) => router.push(`/roadmaps/${id}`)}
                onComplete={onRoadmapComplete}
              />
            ))}
          </Stack>
        </Box>
        <CategoriesPanel categories={categories} />
      </Stack>
    </Card>
  );
}
