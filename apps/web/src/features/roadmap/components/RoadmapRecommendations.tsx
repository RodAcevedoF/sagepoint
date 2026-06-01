"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  useLazySearchPublicRoadmapsQuery,
  useAdoptRoadmapMutation,
} from "@/infrastructure/api/roadmapApi";
import { useSnackbar } from "@/shared/components";
import { aurora, auroraTint } from "@/shared/theme";
import type { RoadmapDto } from "@/infrastructure/api/roadmapApi";

const concept = aurora.status.concept;
const ready = aurora.status.ready;

const styles = {
  container: {
    p: 2,
    borderRadius: aurora.radii.md,
    bgcolor: `color-mix(in oklch, ${concept} 6%, ${aurora.surface})`,
    border: `1px solid ${auroraTint(concept, 0.22)}`,
  },
  label: {
    fontWeight: 600,
    color: concept,
    fontFamily: aurora.font.mono,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "11px",
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
    borderRadius: aurora.radii.sm,
    bgcolor: aurora.surface2,
    border: `1px solid ${aurora.line}`,
    cursor: "pointer",
    transition: "background .2s, border-color .2s",
    "&:hover": {
      bgcolor: `color-mix(in oklch, ${concept} 8%, ${aurora.surface2})`,
      borderColor: auroraTint(concept, 0.3),
    },
  },
  roadmapInfo: {
    minWidth: 0,
    flex: 1,
  },
  roadmapTitle: {
    fontWeight: 600,
    color: aurora.txHi,
    fontFamily: aurora.font.ui,
  },
  roadmapMeta: {
    color: aurora.txLow,
    fontFamily: aurora.font.ui,
  },
  adoptButton: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    px: 1.5,
    py: 0.5,
    border: `1px solid ${auroraTint(ready, 0.32)}`,
    borderRadius: aurora.radii.sm,
    bgcolor: `color-mix(in oklch, ${ready} 12%, ${aurora.surface2})`,
    color: ready,
    fontSize: "0.75rem",
    fontWeight: 600,
    fontFamily: aurora.font.ui,
    cursor: "pointer",
    transition: "background .2s, border-color .2s",
    flexShrink: 0,
    "&:hover": {
      bgcolor: `color-mix(in oklch, ${ready} 18%, ${aurora.surface2})`,
      borderColor: auroraTint(ready, 0.5),
    },
  },
};

function isConflict(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: unknown }).status === 409
  );
}

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
    } catch (err) {
      // 409 = it's already yours (you can't adopt your own roadmap). Just open it.
      if (isConflict(err)) {
        router.push(`/roadmaps/${roadmap.id}`);
      } else {
        showSnackbar("Failed to adopt roadmap", { severity: "error" });
      }
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
