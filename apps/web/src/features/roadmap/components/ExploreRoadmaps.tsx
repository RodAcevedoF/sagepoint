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
import {
  Compass,
  Globe,
  Users,
  Heart,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePublicRoadmapsQuery } from "@/application/roadmap";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import { ErrorState, SearchInput } from "@/common/components";
import { palette } from "@/common/theme";
import { RoadmapCardSkeleton } from "./RoadmapCardSkeleton";
import { CategoryFilter } from "./CategoryFilter";
import { ExploreCard } from "./ExploreCard";

const MotionBox = motion.create(Box);
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
  heroContainer: {
    mb: 6,
    position: "relative",
  },
  heroContent: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    p: { xs: 5, md: 8 },
    background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(palette.secondary.light, 0.1)}`,
    boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
  },
  gradientOrb: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.secondary.main, 0.15)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  secondaryOrb: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.success.main, 0.08)} 0%, transparent 70%)`,
    filter: "blur(50px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  title: {
    fontWeight: 900,
    mb: 2,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.secondary.light} 50%, ${palette.success.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: { xs: "2.5rem", md: "3.5rem" },
    letterSpacing: "-1.5px",
    lineHeight: 1.1,
    position: "relative",
    zIndex: 1,
  },
  subtitle: {
    color: palette.text.secondary,
    mb: 2,
    maxWidth: 540,
    fontSize: "1.1rem",
    lineHeight: 1.6,
    position: "relative",
    zIndex: 1,
    opacity: 0.9,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 0.5,
    borderRadius: 100,
    bgcolor: alpha(palette.secondary.main, 0.1),
    border: `1px solid ${alpha(palette.secondary.main, 0.2)}`,
    color: palette.secondary.light,
    mb: 3,
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    position: "relative",
    zIndex: 1,
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

  // Reset to page 1 when category or search changes
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

  // Compute category counts from the full roadmap list
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
    const usedCategoryIds = new Set(
      roadmaps.map((r) => r.categoryId).filter(Boolean),
    );
    return categories.filter((c) => usedCategoryIds.has(c.id));
  }, [roadmaps, categories]);

  // Pagination
  const totalItems = filteredRoadmaps?.length ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedRoadmaps = useMemo(() => {
    if (!filteredRoadmaps) return undefined;
    const start = (page - 1) * PAGE_SIZE;
    return filteredRoadmaps.slice(start, start + PAGE_SIZE);
  }, [filteredRoadmaps, page]);

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={styles.heroContainer}
      >
        <Box sx={styles.heroContent}>
          <Box sx={styles.gradientOrb} />
          <Box sx={styles.secondaryOrb} />

          {/* Floating Icons */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotate: [0, 12, 0],
              opacity: [0.08, 0.18, 0.08],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={
              {
                position: "absolute",
                top: "15%",
                right: "12%",
                color: palette.secondary.light,
                pointerEvents: "none",
              } as React.CSSProperties
            }
          >
            <Globe size={52} />
          </motion.div>
          <motion.div
            animate={{ x: [0, 25, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={
              {
                position: "absolute",
                bottom: "22%",
                right: "22%",
                color: palette.success.light,
                pointerEvents: "none",
              } as React.CSSProperties
            }
          >
            <Users size={40} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], opacity: [0.04, 0.1, 0.04] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={
              {
                position: "absolute",
                top: "25%",
                left: "8%",
                color: palette.info.light,
                pointerEvents: "none",
              } as React.CSSProperties
            }
          >
            <Heart size={32} />
          </motion.div>

          <Box sx={styles.badge}>
            <Compass size={14} />
            Community
          </Box>

          <Typography variant="h3" sx={styles.title}>
            Explore Roadmaps
          </Typography>

          <Typography variant="body1" sx={styles.subtitle}>
            Discover learning paths shared by the community. Find inspiration
            and start learning from curated roadmaps.
          </Typography>
        </Box>
      </MotionBox>

      {/* Browse by Category */}
      {!isLoading && (
        <Box
          component={Link}
          href="/explore/rooms"
          sx={{
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
          }}
        >
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

      {!isLoading &&
        !error &&
        filteredRoadmaps &&
        filteredRoadmaps.length === 0 && (
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
