"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Pagination,
  Skeleton,
  alpha,
} from "@mui/material";
import { BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  EmptyState,
  ErrorState,
  SearchInput,
  GoBackButton,
} from "@/common/components";
import { useGetCategoryRoomDetailQuery } from "@/infrastructure/api/categoryRoomApi";
import { ExploreCard } from "@/features/roadmap/components/ExploreCard";
import { RoadmapCardSkeleton } from "@/features/roadmap/components/RoadmapCardSkeleton";
import { palette } from "@/common/theme";

const PAGE_SIZE = 12;

const MotionBox = motion.create(Box);

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const styles = {
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    p: { xs: 5, md: 8 },
    mb: 5,
    background: `linear-gradient(135deg, ${alpha(palette.background.paper, 0.8)} 0%, ${alpha(palette.background.paper, 0.4)} 100%)`,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(palette.warning.light, 0.1)}`,
    boxShadow: `0 24px 48px ${alpha(palette.background.default, 0.4)}`,
  },
  gradientOrb: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(palette.warning.main, 0.12)} 0%, transparent 70%)`,
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  title: {
    fontWeight: 900,
    mb: 1.5,
    background: `linear-gradient(135deg, ${palette.text.primary} 0%, ${palette.warning.light} 100%)`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: { xs: "2rem", md: "2.75rem" },
    letterSpacing: "-1px",
    lineHeight: 1.1,
  },
  statsRow: {
    display: "flex",
    gap: 3,
    mt: 2,
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    fontWeight: 600,
    fontSize: "0.9rem",
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

interface RoomDetailProps {
  slug: string;
}

export function RoomDetail({ slug }: RoomDetailProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetCategoryRoomDetailQuery({
    slug,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  if (error) {
    return (
      <ErrorState
        title="Room not found"
        description="This category room doesn't exist or has no public roadmaps."
      />
    );
  }

  const totalPages = data ? Math.ceil(data.roadmaps.total / PAGE_SIZE) : 0;

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Box sx={styles.hero}>
          <Box sx={styles.gradientOrb} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <GoBackButton label="Category Rooms" size="small" />
            </Box>

            {isLoading ? (
              <>
                <Skeleton width={300} height={48} animation="wave" />
                <Skeleton
                  width={450}
                  height={24}
                  sx={{ mt: 1 }}
                  animation="wave"
                />
              </>
            ) : data ? (
              <>
                <Typography variant="h3" sx={styles.title}>
                  {data.category.name}
                </Typography>
                {data.category.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      opacity: 0.9,
                      maxWidth: 540,
                    }}
                  >
                    {data.category.description}
                  </Typography>
                )}
                <Box sx={styles.statsRow}>
                  <Box sx={{ ...styles.stat, color: palette.info.light }}>
                    <BookOpen size={16} />
                    {data.roadmapCount} roadmap
                    {data.roadmapCount !== 1 ? "s" : ""}
                  </Box>
                  <Box sx={{ ...styles.stat, color: palette.success.light }}>
                    <Users size={16} />
                    {data.memberCount} member{data.memberCount !== 1 ? "s" : ""}
                  </Box>
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </MotionBox>

      {/* Search */}
      <Box sx={{ mb: 4, maxWidth: 480 }}>
        <SearchInput
          placeholder={`Search in ${data?.category.name ?? "this room"}...`}
          onSearch={handleSearch}
          debounceMs={300}
        />
      </Box>

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <RoadmapCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : data && data.roadmaps.items.length > 0 ? (
        <>
          <Grid
            container
            spacing={3}
            component={motion.div}
            key={`${search}-${page}`}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {data.roadmaps.items.map((roadmap) => (
              <Grid
                key={roadmap.id}
                size={{ xs: 12, sm: 6, lg: 4 }}
                component={motion.div}
                variants={item}
              >
                <ExploreCard roadmap={roadmap} />
              </Grid>
            ))}
          </Grid>

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
      ) : (
        <EmptyState
          title="No roadmaps found"
          description={
            search
              ? "No roadmaps match your search. Try different keywords."
              : "This room doesn't have any public roadmaps yet."
          }
        />
      )}
    </Box>
  );
}
