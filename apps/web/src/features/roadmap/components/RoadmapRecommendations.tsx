"use client";

import { useEffect, useState } from "react";
import { Box, Typography, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  useLazySearchPublicRoadmapsQuery,
  useAdoptRoadmapMutation,
} from "@/infrastructure/api/roadmapApi";
import { useSnackbar } from "@/common/components";
import { palette } from "@/common/theme";
import type { RoadmapDto } from "@/infrastructure/api/roadmapApi";

const styles = {
  container: {
    mb: 2,
    p: 2,
    borderRadius: 3,
    bgcolor: alpha(palette.info.main, 0.04),
    border: `1px solid ${alpha(palette.info.main, 0.1)}`,
  },
  label: {
    fontWeight: 700,
    color: palette.info.light,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    mb: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 0.75,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  roadmapItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    p: 1.5,
    borderRadius: 2,
    bgcolor: alpha(palette.background.paper, 0.5),
    border: `1px solid ${alpha(palette.info.main, 0.08)}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      bgcolor: alpha(palette.info.main, 0.06),
      borderColor: alpha(palette.info.main, 0.2),
    },
  },
  roadmapInfo: {
    minWidth: 0,
    flex: 1,
  },
  roadmapTitle: {
    fontWeight: 600,
    color: "text.primary",
  },
  roadmapMeta: {
    color: "text.secondary",
  },
  adoptButton: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.5,
    py: 0.5,
    border: `1px solid ${alpha(palette.success.main, 0.3)}`,
    borderRadius: 2,
    bgcolor: alpha(palette.success.main, 0.08),
    color: palette.success.light,
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
    "&:hover": {
      bgcolor: alpha(palette.success.main, 0.15),
      borderColor: palette.success.main,
    },
  },
};

interface RoadmapRecommendationsProps {
  topic: string;
  disabled?: boolean;
}

export function RoadmapRecommendations({
  topic,
  disabled,
}: RoadmapRecommendationsProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [trigger, { data: results, isFetching }] =
    useLazySearchPublicRoadmapsQuery();
  const [adoptRoadmap] = useAdoptRoadmapMutation();
  const [adoptingId, setAdoptingId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    trigger({ q: query, limit: 4 });
  }, 400);

  useEffect(() => {
    const trimmed = topic.trim();
    if (!trimmed || trimmed.length < 3) return;
    debouncedSearch(trimmed);
  }, [topic, debouncedSearch]);

  const handleAdopt = async (e: React.MouseEvent, roadmap: RoadmapDto) => {
    e.stopPropagation();
    if (adoptingId) return;
    setAdoptingId(roadmap.id);
    try {
      await adoptRoadmap(roadmap.id).unwrap();
      showSnackbar(`"${roadmap.title}" added to your library!`, {
        severity: "success",
      });
      router.push(`/roadmaps/${roadmap.id}`);
    } catch {
      showSnackbar("Failed to adopt roadmap", { severity: "error" });
    } finally {
      setAdoptingId(null);
    }
  };

  const topicLower = topic.trim().toLowerCase();
  const visibleResults =
    results?.filter((r) => r.title.toLowerCase() !== topicLower) ?? [];
  if (disabled || visibleResults.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={styles.container}>
          <Typography variant="caption" sx={styles.label}>
            <BookOpen size={14} />
            Similar roadmaps exist
            {isFetching && (
              <Loader2
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
          </Typography>

          <Box sx={styles.list}>
            {visibleResults.map((roadmap) => (
              <Box
                key={roadmap.id}
                sx={styles.roadmapItem}
                onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
              >
                <Box sx={styles.roadmapInfo}>
                  <Typography variant="body2" sx={styles.roadmapTitle} noWrap>
                    {roadmap.title}
                  </Typography>
                  <Typography variant="caption" sx={styles.roadmapMeta}>
                    {roadmap.steps.length} steps
                    {roadmap.totalEstimatedDuration &&
                      ` · ${Math.round(roadmap.totalEstimatedDuration / 60)}h`}
                  </Typography>
                </Box>

                <Box
                  component="button"
                  onClick={(e: React.MouseEvent) => handleAdopt(e, roadmap)}
                  sx={styles.adoptButton}
                >
                  {adoptingId === roadmap.id ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Plus size={14} />
                  )}
                  Adopt
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
