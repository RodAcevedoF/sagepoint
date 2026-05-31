"use client";

import { useMemo, useState } from "react";
import { Box, Pagination, type SxProps, type Theme } from "@mui/material";
import { Globe, LayoutGrid, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePublicRoadmapsQuery } from "@/application/roadmap";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import {
  AuroraGrid,
  ErrorState,
  SearchInput,
  type AuroraTone,
} from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { categoryTone } from "@/features/blog/constants/categoryAssets";
import { ExploreCard } from "./ExploreCard";
import { ExploreHero } from "./ExploreHero";
import { RoadmapCardSkeleton } from "./RoadmapCardSkeleton";

const PAGE_SIZE = 9;
const ALL = "__all__" as const;
type CategoryFilter = string | typeof ALL;

const styles: Record<string, SxProps<Theme>> = {
  browseLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    mb: 3,
    px: "16px",
    py: "10px",
    borderRadius: auroraPalette.radii.pill,
    background: auroraTint(auroraPalette.teal, 0.1),
    border: `1px solid ${auroraTint(auroraPalette.teal, 0.3)}`,
    textDecoration: "none",
    color: auroraPalette.teal,
    fontFamily: auroraPalette.font.mono,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    width: "fit-content",
    transition: "background-color .2s, transform .2s",
    "&:hover": {
      background: auroraTint(auroraPalette.teal, 0.16),
      transform: "translateX(3px)",
    },
  },
  searchRow: { mb: 3, maxWidth: 480 },
  tabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1.4,
    mb: 4,
  },
  pagination: {
    mt: 5,
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: auroraPalette.txMid,
      fontFamily: auroraPalette.font.ui,
      fontWeight: 600,
      borderColor: auroraPalette.line,
      "&:hover": {
        backgroundColor: "oklch(0.22 0.025 262 / 0.5)",
        borderColor: auroraPalette.line2,
      },
      "&.Mui-selected": {
        backgroundColor: auroraTint(auroraPalette.teal, 0.13),
        borderColor: auroraTint(auroraPalette.teal, 0.45),
        color: auroraPalette.teal,
        "&:hover": {
          backgroundColor: auroraTint(auroraPalette.teal, 0.18),
        },
      },
    },
  },
  emptyCard: {
    py: 8,
    px: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    borderRadius: auroraPalette.radii.card,
    border: `1px dashed ${auroraPalette.line2}`,
    background: "oklch(0.22 0.025 262 / 0.4)",
  },
  emptyTitle: {
    fontFamily: auroraPalette.font.display,
    fontSize: 22,
    color: auroraPalette.txHi,
    margin: 0,
    mt: 2,
    mb: 1,
  },
  emptyDesc: {
    color: auroraPalette.txMid,
    maxWidth: 360,
    margin: "0 auto",
  },
};

function tabSx(on: boolean): SxProps<Theme> {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 1.25,
    px: "18px",
    py: "11px",
    borderRadius: auroraPalette.radii.pill,
    cursor: "pointer",
    border: `1px solid ${on ? auroraTint(auroraPalette.teal, 0.45) : auroraPalette.line}`,
    background: on
      ? auroraTint(auroraPalette.teal, 0.13)
      : "oklch(0.22 0.025 262 / 0.5)",
    color: on ? auroraPalette.teal : auroraPalette.txMid,
    fontWeight: 600,
    fontSize: "14.5px",
    transition: "all .15s",
    whiteSpace: "nowrap",
    "&:hover": on
      ? {}
      : {
          color: auroraPalette.txHi,
          borderColor: auroraPalette.line2,
        },
  };
}

function tabCountSx(on: boolean): SxProps<Theme> {
  return {
    fontFamily: auroraPalette.font.mono,
    fontSize: "11.5px",
    fontWeight: 700,
    px: 1,
    py: 0.25,
    borderRadius: auroraPalette.radii.pill,
    background: on
      ? auroraTint(auroraPalette.teal, 0.2)
      : "oklch(0.30 0.02 262 / 0.7)",
    color: on ? auroraPalette.teal : auroraPalette.txMid,
  };
}

export function ExploreRoadmaps() {
  const { data: roadmaps, isLoading, error } = usePublicRoadmapsQuery();
  const { data: categories } = useCategoriesQuery();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const slugById = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((c) => map.set(c.id, c.slug));
    return map;
  }, [categories]);

  const handleCategoryChange = (id: CategoryFilter) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return undefined;
    let result = roadmaps;
    if (selectedCategory !== ALL) {
      result = result.filter((r) => r.categoryId === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [roadmaps, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    if (!roadmaps) return {};
    const counts: Record<string, number> = {};
    for (const r of roadmaps) {
      if (r.categoryId) {
        counts[r.categoryId] = (counts[r.categoryId] ?? 0) + 1;
      }
    }
    return counts;
  }, [roadmaps]);

  const usedCategories = useMemo(() => {
    if (!roadmaps || !categories) return [];
    const usedIds = new Set(roadmaps.map((r) => r.categoryId).filter(Boolean));
    return categories.filter((c) => usedIds.has(c.id));
  }, [roadmaps, categories]);

  const totalItems = filteredRoadmaps?.length ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedRoadmaps = useMemo(() => {
    if (!filteredRoadmaps) return undefined;
    const start = (page - 1) * PAGE_SIZE;
    return filteredRoadmaps.slice(start, start + PAGE_SIZE);
  }, [filteredRoadmaps, page]);

  const tabs: Array<{ id: CategoryFilter; label: string; count: number }> = [
    { id: ALL, label: "All", count: roadmaps?.length ?? 0 },
    ...usedCategories.map((c) => ({
      id: c.id,
      label: c.name,
      count: categoryCounts[c.id] ?? 0,
    })),
  ];

  const toneForRoadmap = (categoryId?: string): AuroraTone => {
    if (!categoryId) return "teal";
    const slug = slugById.get(categoryId);
    return slug ? categoryTone(slug) : "teal";
  };

  return (
    <Box>
      <ExploreHero />

      {!isLoading && (
        <Box component={Link} href="/explore/rooms" sx={styles.browseLink}>
          <LayoutGrid size={14} />
          Browse by Category
          <ArrowRight size={14} />
        </Box>
      )}

      {!isLoading && (
        <Box sx={styles.searchRow}>
          <SearchInput
            placeholder="Search roadmaps by title or topic..."
            onSearch={handleSearch}
            debounceMs={300}
          />
        </Box>
      )}

      {usedCategories.length > 0 && !isLoading && (
        <Box sx={styles.tabs}>
          {tabs.map((t) => {
            const on = selectedCategory === t.id;
            return (
              <Box
                key={t.id}
                component="span"
                sx={tabSx(on)}
                onClick={() => handleCategoryChange(t.id)}
              >
                {t.label}
                <Box component="span" sx={tabCountSx(on)}>
                  {t.count}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {isLoading && (
        <AuroraGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <RoadmapCardSkeleton key={i} />
          ))}
        </AuroraGrid>
      )}

      {!isLoading && error && (
        <ErrorState
          title="Failed to load roadmaps"
          description="Something went wrong while loading public roadmaps."
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && filteredRoadmaps?.length === 0 && (
        <Box sx={styles.emptyCard}>
          <Globe
            size={40}
            color={auroraPalette.txLow}
            style={{ opacity: 0.6 }}
          />
          <Box component="h3" sx={styles.emptyTitle}>
            No public roadmaps yet
          </Box>
          <Box component="p" sx={styles.emptyDesc}>
            Be the first to share a roadmap with the community!
          </Box>
        </Box>
      )}

      {!isLoading &&
        !error &&
        paginatedRoadmaps &&
        paginatedRoadmaps.length > 0 && (
          <>
            <AuroraGrid>
              {paginatedRoadmaps.map((roadmap) => (
                <ExploreCard
                  key={roadmap.id}
                  roadmap={roadmap}
                  tone={toneForRoadmap(roadmap.categoryId)}
                />
              ))}
            </AuroraGrid>

            {totalPages > 1 && (
              <Box sx={styles.pagination}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  shape="rounded"
                  size="large"
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}
    </Box>
  );
}
