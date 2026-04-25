"use client";

import { useRouter } from "next/navigation";
import { Typography, Stack, Button, Box } from "@mui/material";
import { Flame, Trophy, Sparkles } from "lucide-react";
import { Card } from "@/shared/components";
import { palette } from "@/shared/theme";
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

export function DashboardRoadmaps({
  roadmaps,
  overview,
  allRoadmaps,
  onRoadmapComplete,
}: DashboardRoadmapsProps) {
  const router = useRouter();
  const categories = computeCategoriesOverview(allRoadmaps);

  return (
    <Card variant="outlined" sx={{ p: 3, height: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={700}>
          Your Roadmaps
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={() => router.push("/roadmaps")}
          sx={{ color: palette.text.secondary, textTransform: "none" }}
        >
          View all
        </Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
        <OverviewChip
          count={overview.inProgress}
          label="in progress"
          icon={<Flame size={13} strokeWidth={2.4} />}
          color={palette.warning.main}
        />
        <OverviewChip
          count={overview.completed}
          label="completed"
          icon={<Trophy size={13} strokeWidth={2.4} />}
          color={palette.success.main}
        />
        <OverviewChip
          count={overview.justCreated}
          label="just created"
          icon={<Sparkles size={13} strokeWidth={2.4} />}
          color={palette.info.main}
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
