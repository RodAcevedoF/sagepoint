"use client";

import { useMemo, useState } from "react";
import {
  alpha,
  Box,
  Grid,
  Typography,
  Pagination,
  type Theme,
  type SxProps,
} from "@mui/material";
import { Globe, LayoutGrid, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePublicRoadmapsQuery } from "@/application/roadmap";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import { ErrorState, SearchInput } from "@/shared/components";
import { palette } from "@/shared/theme";
import { RoadmapCardSkeleton } from "./RoadmapCardSkeleton";
import { CategoryFilter } from "./CategoryFilter";
import { ExploreCard } from "./ExploreCard";
import { ExploreHero } from "./ExploreHero";

const MotionGrid = motion.create(Grid);

const PAGE_SIZE = 9;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const styles: Record<string, SxProps<Theme>> = {
  browseLink: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    mb: 3,
    px: 2.5,
    py: 1.5,
    borderRadius: 3,
    bgcolor: alpha(palette.warning.main, 0.06),
    border: `1px solid ${alpha(palette.warning.main, 0.12)}`,
    textDecoration: "none",
    color: palette.warning.light,
    fontWeight: 600,
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    width: "fit-content",
    "&:hover": {
      bgcolor: alpha(palette.warning.main, 0.1),
      borderColor: alpha(palette.warning.main, 0.25),
      transform: "translateX(4px)",
    },
  },
  emptyState: {
    textAlign: "center",
    py: 10,
  },
  pagination: {
    mt: 5,
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: palette.text.secondary,
      fontWeight: 600,
      "&.Mui-selected": {
        bgcolor: alpha(palette.primary.main, 0.15),
        color: palette.primary.light,
        "&:hover": { bgcolor: alpha(palette.primary.main, 0.25) },
      },
    },
  },
};

export function ExploreRoadmaps() {
  const { data: roadmaps, isLoading, error } = usePublicRoadmapsQuery();
  const { data: categories } = useCategoriesQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return undefined;
    let result = roadmaps;
    if (selectedCategory) {
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

  return (
    <Box>
      <ExploreHero />

      {!isLoading && (
        <Box component={Link} href="/explore/rooms" sx={styles.browseLink}>
          <LayoutGrid size={16} />
          Browse by Category
          <ArrowRight size={16} />
        </Box>
      )}

      {!isLoading && (
        <Box sx={{ mb: 3, maxWidth: 480 }}>
          <SearchInput
            placeholder="Search roadmaps by title or topic..."
            onSearch={handleSearch}
            debounceMs={300}
          />
        </Box>
      )}

      {usedCategories.length > 0 && !isLoading && (
        <Box sx={{ mb: 4 }}>
          <CategoryFilter
            categories={usedCategories}
            selectedCategory={selectedCategory}
            onSelect={handleCategoryChange}
            counts={categoryCounts}
            totalCount={roadmaps?.length}
          />
        </Box>
      )}

      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <RoadmapCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && error && (
        <ErrorState
          title="Failed to load roadmaps"
          description="Something went wrong while loading public roadmaps."
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && filteredRoadmaps?.length === 0 && (
        <Box sx={styles.emptyState}>
          <Globe
            size={48}
            color={palette.text.secondary}
            style={{ opacity: 0.3, marginBottom: 16 }}
          />
          <Typography
            variant="h6"
            sx={{ color: palette.text.secondary, mb: 1 }}
          >
            No public roadmaps yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: palette.text.secondary, opacity: 0.7 }}
          >
            Be the first to share a roadmap with the community!
          </Typography>
        </Box>
      )}

      {!isLoading &&
        !error &&
        paginatedRoadmaps &&
        paginatedRoadmaps.length > 0 && (
          <>
            <MotionGrid
              key={`${selectedCategory}-${searchQuery}-${page}`}
              container
              spacing={3}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {paginatedRoadmaps.map((roadmap) => (
                <Grid
                  key={roadmap.id}
                  size={{ xs: 12, sm: 6, lg: 4 }}
                  component={motion.div}
                  variants={staggerItem}
                >
                  <ExploreCard roadmap={roadmap} />
                </Grid>
              ))}
            </MotionGrid>

            {totalPages > 1 && (
              <Box sx={styles.pagination}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
    </Box>
  );
}
