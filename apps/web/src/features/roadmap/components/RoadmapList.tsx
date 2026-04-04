"use client";

import { useState, useMemo } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { BookOpen, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserRoadmapsQuery } from "@/application/roadmap";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import { ErrorState, Button } from "@/common/components";
import { ButtonIconPositions, ButtonSizes } from "@/common/types";
import { RoadmapCard } from "./RoadmapCard";
import { RoadmapCardSkeleton } from "./RoadmapCardSkeleton";
import { RoadmapHero } from "./RoadmapHero";
import { RoadmapStats } from "./RoadmapStats";
import { CategoryFilter } from "./CategoryFilter";
import { GeneratingCard } from "./GeneratingCard";
import { makeStyles } from "./RoadmapList.styles";

const MotionGrid = motion.create(Grid);

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const floatingIcons = [
  { Icon: BookOpen, x: "15%", y: "20%", delay: 0 },
  { Icon: Lightbulb, x: "75%", y: "15%", delay: 0.3 },
  { Icon: Rocket, x: "85%", y: "70%", delay: 0.6 },
];

function EmptyRoadmapState() {
  const theme = useTheme();
  const router = useRouter();
  const styles = makeStyles(theme);

  return (
    <Box sx={styles.emptyStateContainer}>
      {floatingIcons.map(({ Icon, x, y, delay }) => (
        <motion.div
          key={delay}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay },
          }}
          style={{ ...styles.floatingIcon, left: x, top: y }}
        >
          <Icon size={32} />
        </motion.div>
      ))}

      <Typography variant="h6" sx={styles.emptyStateTitle}>
        No roadmaps yet
      </Typography>
      <Typography variant="body2" sx={styles.emptyStateSubtitle}>
        Create your first learning roadmap by telling us what you want to learn.
      </Typography>
      <Button
        label="Create Your First Roadmap"
        icon={Sparkles}
        iconPos={ButtonIconPositions.START}
        size={ButtonSizes.LARGE}
        onClick={() => router.push("/roadmaps/create")}
      />
    </Box>
  );
}

export function RoadmapList() {
  const { data: roadmaps, isLoading, error, refetch } = useUserRoadmapsQuery();
  const { data: categories } = useCategoriesQuery();
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return undefined;
    if (!selectedCategory) return roadmaps;
    return roadmaps.filter((r) => r.roadmap.categoryId === selectedCategory);
  }, [roadmaps, selectedCategory]);

  const usedCategories = useMemo(() => {
    if (!roadmaps || !categories) return [];
    const usedCategoryIds = new Set(
      roadmaps.map((r) => r.roadmap.categoryId).filter(Boolean),
    );
    return categories.filter((c) => usedCategoryIds.has(c.id));
  }, [roadmaps, categories]);

  const completedRoadmaps = filteredRoadmaps?.filter(
    (r) => r.roadmap.generationStatus === "completed",
  );
  const generatingRoadmaps = filteredRoadmaps?.filter(
    (r) =>
      r.roadmap.generationStatus === "pending" ||
      r.roadmap.generationStatus === "processing",
  );
  const failedRoadmaps = filteredRoadmaps?.filter(
    (r) => r.roadmap.generationStatus === "failed",
  );

  const hasCompleted = completedRoadmaps && completedRoadmaps.length > 0;
  const hasGenerating = generatingRoadmaps && generatingRoadmaps.length > 0;
  const hasFailed = failedRoadmaps && failedRoadmaps.length > 0;
  const hasAny = filteredRoadmaps && filteredRoadmaps.length > 0;

  return (
    <Box>
      <RoadmapHero />

      {usedCategories.length > 0 && !isLoading && (
        <Box sx={{ mb: 4 }}>
          <CategoryFilter
            categories={usedCategories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
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
          description="Something went wrong while loading your roadmaps."
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !hasAny && <EmptyRoadmapState />}

      {!isLoading && !error && (hasGenerating || hasFailed) && (
        <Box sx={styles.generatingSection}>
          <Grid container spacing={2}>
            {generatingRoadmaps?.map((item) => (
              <Grid key={item.roadmap.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <GeneratingCard data={item} onComplete={refetch} />
              </Grid>
            ))}
            {failedRoadmaps?.map((item) => (
              <Grid key={item.roadmap.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <GeneratingCard data={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!isLoading && !error && hasCompleted && (
        <>
          <RoadmapStats roadmaps={completedRoadmaps} />

          <MotionGrid
            key={completedRoadmaps.length}
            container
            spacing={3}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {completedRoadmaps.map((item) => (
              <Grid
                key={item.roadmap.id}
                size={{ xs: 12, sm: 6, lg: 4 }}
                component={motion.div}
                variants={staggerItem}
              >
                <RoadmapCard data={item} />
              </Grid>
            ))}
          </MotionGrid>
        </>
      )}
    </Box>
  );
}
