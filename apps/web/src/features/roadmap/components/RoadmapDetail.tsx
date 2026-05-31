"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Box, ButtonBase } from "@mui/material";
import { List, GitFork } from "lucide-react";
import { useRouter } from "next/navigation";
import { StepStatus } from "@sagepoint/domain";
import {
  useRoadmapWithProgressQuery,
  useRoadmapWithProgressQueryState,
} from "@/application/roadmap";
import { roadmapApi } from "@/infrastructure/api/roadmapApi";
import {
  BackLink,
  EmptyState,
  ErrorState,
  Loader,
  PageLoader,
} from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import { useCurrentUser } from "@/features/auth/context/UserContext";
import { useRoadmapEvents, useAppDispatch } from "@/shared/hooks";
import { groupRoadmapStepsForTimeline } from "../utils/roadmap.utils";
import { TimelineStep } from "./TimelineStep/TimelineStep";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { RoadmapDetailHero } from "./RoadmapDetailHero";

const LazyRoadmapGraph = lazy(() =>
  import("./RoadmapGraph/RoadmapGraph").then((m) => ({
    default: m.RoadmapGraph,
  })),
);

interface RoadmapDetailProps {
  roadmapId: string;
}

type View = "timeline" | "graph";

const VIEW_ITEMS: ReadonlyArray<{
  id: View;
  label: string;
  icon: typeof List;
}> = [
  { id: "timeline", label: "Timeline", icon: List },
  { id: "graph", label: "Graph", icon: GitFork },
];

function groupResourcesByConceptId<T extends { conceptId: string }>(
  resources: T[],
): Record<string, T[]> {
  return resources.reduce(
    (acc, resource) => {
      if (!acc[resource.conceptId]) acc[resource.conceptId] = [];
      acc[resource.conceptId].push(resource);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function RoadmapDetail({ roadmapId }: RoadmapDetailProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("timeline");
  const currentUserId = useCurrentUser()?.id;
  const dispatch = useAppDispatch();

  const { data: cachedData } = useRoadmapWithProgressQueryState(roadmapId);
  const isResourcesPending =
    !cachedData || cachedData.roadmap.resourcesStatus === "processing";

  const { status: sseStatus } = useRoadmapEvents(
    isResourcesPending ? roadmapId : null,
  );
  useEffect(() => {
    if (sseStatus !== "completed") return;
    dispatch(
      roadmapApi.util.invalidateTags([
        { type: "Roadmap", id: roadmapId },
        { type: "RoadmapProgress", id: roadmapId },
      ]),
    );
  }, [sseStatus, roadmapId, dispatch]);

  const pollingInterval = isResourcesPending ? 5_000 : 0;
  const {
    data: roadmapData,
    isLoading: roadmapLoading,
    error: roadmapError,
  } = useRoadmapWithProgressQuery(roadmapId, { pollingInterval });

  const resourcesByConceptId = useMemo(
    () =>
      roadmapData?.resources
        ? groupResourcesByConceptId(roadmapData.resources)
        : {},
    [roadmapData],
  );

  const allSteps = useMemo(
    () =>
      [...(roadmapData?.roadmap.steps || [])].sort((a, b) => a.order - b.order),
    [roadmapData],
  );

  const { topLevelSteps, subConceptsByParent, expandedConceptIds } = useMemo(
    () => groupRoadmapStepsForTimeline(allSteps),
    [allSteps],
  );

  if (roadmapLoading) {
    return <PageLoader message="Loading roadmap" />;
  }

  if (roadmapError || !roadmapData) {
    return (
      <ErrorState
        title="Roadmap not found"
        description="The roadmap you're looking for doesn't exist or you don't have access to it."
        onRetry={() => router.push("/roadmaps")}
        retryLabel="Back to Roadmaps"
      />
    );
  }

  const { roadmap, progress, stepProgress } = roadmapData;
  const isOwner = !!currentUserId && roadmap.userId === currentUserId;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "26px",
        paddingTop: "4px",
        paddingBottom: "64px",
      }}
    >
      <BackLink label="Back to Roadmaps" href="/roadmaps" />

      <RoadmapDetailHero
        roadmapId={roadmap.id}
        title={roadmap.title}
        description={roadmap.description}
        totalSteps={progress.totalSteps}
        completedSteps={progress.completedSteps}
        progressPercentage={progress.progressPercentage}
        estimatedDuration={roadmap.totalEstimatedDuration}
        recommendedPace={roadmap.recommendedPace}
        categoryId={roadmap.categoryId}
        isOwner={isOwner}
      />

      {topLevelSteps.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Box
            component="h2"
            sx={{
              margin: 0,
              fontFamily: auroraPalette.font.display,
              fontWeight: 700,
              fontSize: "19px",
              color: auroraPalette.txHi,
              letterSpacing: "-0.015em",
            }}
          >
            Learning Timeline
          </Box>
          <Box
            sx={{
              display: "inline-flex",
              padding: "4px",
              borderRadius: auroraPalette.radii.md,
              background: "oklch(0.20 0.025 262 / 0.7)",
              border: `1px solid ${auroraPalette.line}`,
              gap: "4px",
            }}
          >
            {VIEW_ITEMS.map((item) => {
              const isOn = view === item.id;
              const Icon = item.icon;
              return (
                <ButtonBase
                  key={item.id}
                  disableRipple
                  onClick={() => setView(item.id)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "9px",
                    background: isOn
                      ? auroraTint(auroraPalette.teal, 0.14)
                      : "transparent",
                    color: isOn ? auroraPalette.teal : auroraPalette.txMid,
                    boxShadow: isOn
                      ? `0 0 0 1px ${auroraTint(auroraPalette.teal, 0.25)} inset`
                      : "none",
                    fontFamily: auroraPalette.font.ui,
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all .15s",
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}

      {topLevelSteps.length === 0 ? (
        roadmap.generationStatus !== "completed" ? (
          <Loader variant="page" message="Building your roadmap..." />
        ) : (
          <EmptyState
            title="No steps yet"
            description="This roadmap doesn't have any steps defined."
          />
        )
      ) : view === "graph" ? (
        <Suspense fallback={<Loader message="Loading graph" />}>
          <LazyRoadmapGraph steps={allSteps} stepProgress={stepProgress} />
        </Suspense>
      ) : (
        <Box
          sx={{
            position: "relative",
            paddingLeft: "26px",
            "&::before": {
              content: '""',
              position: "absolute",
              left: "19px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              background: `linear-gradient(180deg, ${auroraTint(auroraPalette.teal, 0.5)}, oklch(0.30 0.02 262 / 0.6))`,
            },
          }}
        >
          {topLevelSteps.map((step, index) => (
            <TimelineStep
              key={step.concept.id}
              step={step}
              roadmapId={roadmapId}
              status={stepProgress[step.concept.id] || StepStatus.NOT_STARTED}
              resources={resourcesByConceptId[step.concept.id] || []}
              resourcesLoading={
                roadmapData.roadmap.resourcesStatus === "processing"
              }
              isLast={index === topLevelSteps.length - 1}
              index={index}
              parentDocumentId={roadmap.documentId}
              isExpanded={expandedConceptIds.has(step.concept.id)}
              subSteps={subConceptsByParent.get(step.concept.id) ?? []}
              subStepProgress={stepProgress}
              subStepResources={resourcesByConceptId}
              parentOrder={step.order}
              isOwner={isOwner}
            />
          ))}
        </Box>
      )}

      <SuggestionsPanel roadmapId={roadmapId} />
    </Box>
  );
}
