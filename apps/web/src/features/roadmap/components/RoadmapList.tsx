"use client";

import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import { BookOpen, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useUserRoadmapsQuery } from "@/application/roadmap";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import {
  AuroraGrid,
  AuroraTabs,
  Button,
  ErrorState,
  SecTitle,
  useModal,
  type AuroraTabItem,
} from "@/shared/components";
import { aurora as auroraPalette } from "@/shared/theme";
import {
  ButtonIconPositions,
  ButtonSizes,
  ButtonVariants,
} from "@/shared/types";
import { RoadmapCard } from "./RoadmapCard/RoadmapCard";
import { RoadmapCardSkeleton } from "./RoadmapCardSkeleton";
import { RoadmapHero } from "./RoadmapHero";
import { RoadmapStats } from "./RoadmapStats";
import { GeneratingCard } from "./GeneratingCard/GeneratingCard";
import { CreateRoadmapModal } from "./CreateRoadmapModal/CreateRoadmapModal";

const floatingIcons = [
  { Icon: BookOpen, x: "15%", y: "20%", delay: 0 },
  { Icon: Lightbulb, x: "75%", y: "15%", delay: 0.3 },
  { Icon: Rocket, x: "85%", y: "70%", delay: 0.6 },
];

const ALL_CATEGORY = "__all__" as const;
type CategoryFilter = string | typeof ALL_CATEGORY;

function EmptyRoadmapState() {
  const { openModal } = useModal();

  const handleCreate = () => {
    openModal(<CreateRoadmapModal />, {
      title: "Create Roadmap",
      showCloseButton: true,
      maxWidth: "sm",
    });
  };

  return (
    <Box
      sx={{
        position: "relative",
        padding: "64px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: `2px dashed ${auroraPalette.line}`,
        borderRadius: auroraPalette.radii.card,
        overflow: "hidden",
      }}
    >
      {floatingIcons.map(({ Icon, x, y, delay }) => (
        <motion.div
          key={delay}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.18, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay },
          }}
          style={{
            position: "absolute",
            left: x,
            top: y,
            color: auroraPalette.teal,
          }}
        >
          <Icon size={32} />
        </motion.div>
      ))}

      <Box
        component="h3"
        sx={{
          fontFamily: auroraPalette.font.display,
          fontSize: 22,
          color: auroraPalette.txHi,
          margin: 0,
          marginBottom: "8px",
        }}
      >
        No roadmaps yet
      </Box>
      <Box
        component="p"
        sx={{
          color: auroraPalette.txMid,
          maxWidth: 360,
          margin: "0 0 22px",
        }}
      >
        Create your first learning roadmap by telling us what you want to learn.
      </Box>
      <Button
        label="Create Your First Roadmap"
        icon={Sparkles}
        iconPos={ButtonIconPositions.START}
        size={ButtonSizes.LARGE}
        variant={ButtonVariants.AURORA}
        onClick={handleCreate}
      />
    </Box>
  );
}

export function RoadmapList() {
  const { data: roadmaps, isLoading, error, refetch } = useUserRoadmapsQuery();
  const { data: categories } = useCategoriesQuery();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>(ALL_CATEGORY);

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return undefined;
    if (selectedCategory === ALL_CATEGORY) return roadmaps;
    return roadmaps.filter((r) => r.roadmap.categoryId === selectedCategory);
  }, [roadmaps, selectedCategory]);

  const usedCategories = useMemo(() => {
    if (!roadmaps || !categories) return [];
    const usedCategoryIds = new Set(
      roadmaps.map((r) => r.roadmap.categoryId).filter(Boolean),
    );
    return categories.filter((c) => usedCategoryIds.has(c.id));
  }, [roadmaps, categories]);

  const categoryTabs = useMemo<ReadonlyArray<AuroraTabItem>>(() => {
    return [
      { id: ALL_CATEGORY, label: "All" },
      ...usedCategories.map((c) => ({ id: c.id, label: c.name })),
    ];
  }, [usedCategories]);

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

  if (isLoading) {
    return (
      <>
        <RoadmapHero />
        <AuroraGrid style={{ marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <RoadmapCardSkeleton key={i} />
          ))}
        </AuroraGrid>
      </>
    );
  }

  if (error) {
    return (
      <>
        <RoadmapHero />
        <ErrorState
          title="Failed to load roadmaps"
          description="Something went wrong while loading your roadmaps."
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <>
      <RoadmapHero />

      {!hasAny && <EmptyRoadmapState />}

      {hasAny && (
        <>
          {hasCompleted && <RoadmapStats roadmaps={completedRoadmaps} />}

          {usedCategories.length > 0 && (
            <AuroraTabs
              items={categoryTabs}
              activeId={selectedCategory}
              onChange={setSelectedCategory}
              style={{ marginBottom: 24 }}
            />
          )}

          {(hasGenerating || hasFailed) && (
            <section style={{ marginBottom: 36 }}>
              <SecTitle>
                In Progress (
                {(generatingRoadmaps?.length ?? 0) +
                  (failedRoadmaps?.length ?? 0)}
                )
              </SecTitle>
              <AuroraGrid style={{ marginTop: 16 }}>
                {generatingRoadmaps?.map((item) => (
                  <GeneratingCard
                    key={item.roadmap.id}
                    data={item}
                    onComplete={refetch}
                  />
                ))}
                {failedRoadmaps?.map((item) => (
                  <GeneratingCard key={item.roadmap.id} data={item} />
                ))}
              </AuroraGrid>
            </section>
          )}

          {hasCompleted && (
            <section>
              {(hasGenerating || hasFailed) && (
                <SecTitle>My Roadmaps ({completedRoadmaps.length})</SecTitle>
              )}
              <AuroraGrid
                style={{
                  marginTop: hasGenerating || hasFailed ? 16 : 0,
                }}
              >
                {completedRoadmaps.map((item, index) => (
                  <motion.div
                    key={item.roadmap.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 * index }}
                  >
                    <RoadmapCard data={item} />
                  </motion.div>
                ))}
              </AuroraGrid>
            </section>
          )}
        </>
      )}
    </>
  );
}
