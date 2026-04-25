"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stack,
  Button,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  Flame,
  Trophy,
  Sparkles,
  Layers,
  Hash,
  BookOpen,
  Zap,
  Compass,
} from "lucide-react";

import { RoadmapCard } from "./RoadmapCard";
import { pickItemColor } from "../constants";
import type {
  RoadmapItem,
  RoadmapsOverview,
  DashboardRoadmap,
} from "../types/dashboard.types";
import {
  computeCategoriesOverview,
  type CategoryCount,
} from "../utils/dashboard.utils";
import { palette } from "@/shared/theme";
import { Card } from "@/shared/components";

function renderCategoryIcon(index: number) {
  switch (index % 5) {
    case 0:
      return <Hash size={18} strokeWidth={2.2} />;
    case 1:
      return <BookOpen size={18} strokeWidth={2.2} />;
    case 2:
      return <Compass size={18} strokeWidth={2.2} />;
    case 3:
      return <Zap size={18} strokeWidth={2.2} />;
    default:
      return <Layers size={18} strokeWidth={2.2} />;
  }
}

interface OverviewChipProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function OverviewChip({ count, label, icon, color }: OverviewChipProps) {
  if (count === 0) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.6,
        borderRadius: "999px",
        bgcolor: alpha(color, 0.14),
        border: `1px solid ${alpha(color, 0.28)}`,
        color,
      }}
    >
      {icon}
      <Typography variant="caption" fontWeight={700} sx={{ color }}>
        {count} {label}
      </Typography>
    </Box>
  );
}

interface CategoriesPanelProps {
  categories: CategoryCount[];
}

interface CategoryTileProps {
  name: string;
  count: number;
  total: number;
  index: number;
}

function CategoryTile({ name, count, total, index }: CategoryTileProps) {
  const color = pickItemColor(index);
  const accent = palette.difficulty.beginner;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Box
      sx={{
        position: "relative",
        p: 1.75,
        borderRadius: 6,
        overflow: "hidden",
        bgcolor: alpha(accent, 0.035),
        background: `radial-gradient(circle at 0% 0%, ${alpha(accent, 0.14)} 0%, ${alpha(accent, 0.04)} 42%, transparent 78%), linear-gradient(180deg, ${alpha(accent, 0.06)} 0%, ${alpha(accent, 0.02)} 100%)`,
        border: `1px solid ${alpha(accent, 0.12)}`,
        transition: "transform .2s, border-color .2s, background .2s",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: alpha(accent, 0.18),
          background: `radial-gradient(circle at 0% 0%, ${alpha(accent, 0.18)} 0%, ${alpha(accent, 0.06)} 44%, transparent 80%), linear-gradient(180deg, ${alpha(accent, 0.075)} 0%, ${alpha(accent, 0.025)} 100%)`,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(color.main, 0.12),
            color: color.main,
            border: `1px solid ${alpha(color.main, 0.2)}`,
            boxShadow: `0 0 0 1px ${alpha(palette.background.paper, 0.08)}`,
            flexShrink: 0,
          }}
        >
          {renderCategoryIcon(index)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            sx={{ color: palette.text.primary, lineHeight: 1.2 }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: palette.text.secondary, fontWeight: 500 }}
          >
            {count} {count === 1 ? "roadmap" : "roadmaps"}
          </Typography>
        </Box>

        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ color: color.main, fontSize: "0.95rem" }}
        >
          {pct}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: alpha(color.main, 0.08),
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            background: `linear-gradient(90deg, ${color.main}, ${alpha(color.light, 0.85)})`,
          },
        }}
      />
    </Box>
  );
}

function CategoriesPanel({ categories }: CategoriesPanelProps) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const accent = palette.difficulty.beginner;

  return (
    <Box
      sx={{
        flex: { md: 1 },
        minWidth: { md: 300 },
        p: 2.25,
        borderRadius: 6,
        bgcolor: alpha(accent, 0.045),
        border: `1px solid ${alpha(accent, 0.12)}`,
        background: `linear-gradient(180deg, ${alpha(accent, 0.08)} 0%, ${alpha(accent, 0.025)} 100%)`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(accent, 0.12),
              color: accent,
              border: `1px solid ${alpha(accent, 0.18)}`,
            }}
          >
            <Layers size={15} strokeWidth={2.4} />
          </Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              color: accent,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: "0.72rem",
            }}
          >
            Topics
          </Typography>
        </Stack>
        {total > 0 && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "999px",
              bgcolor: alpha(accent, 0.1),
              color: accent,
              fontWeight: 700,
              fontSize: "0.65rem",
            }}
          >
            {categories.length} {categories.length === 1 ? "topic" : "topics"}
          </Typography>
        )}
      </Stack>

      {categories.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 6,
            bgcolor: alpha(accent, 0.03),
            border: `1px dashed ${alpha(accent, 0.14)}`,
            textAlign: "center",
          }}
        >
          <Layers
            size={20}
            color={palette.text.secondary}
            strokeWidth={1.8}
            style={{ opacity: 0.5, marginBottom: 4 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            No categories yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {categories.map(({ name, count }, i) => (
            <CategoryTile
              key={name}
              name={name}
              count={count}
              total={total}
              index={i}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

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
          color={palette.purple.main}
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
