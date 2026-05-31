"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { Card, Pipeline, StatusPill, toneColor } from "@/shared/components";
import { useRoadmapEvents } from "@/shared/hooks";

import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
import type { RoadmapEventStage } from "@/shared/hooks";

const GENERATION_STAGES = [
  "Concepts",
  "Learning path",
  "Resources",
  "Done",
] as const;

const STAGE_INDEX: Record<RoadmapEventStage & string, number> = {
  concepts: 0,
  "learning-path": 1,
  resources: 2,
  done: 3,
};

const STAGE_LABEL: Record<RoadmapEventStage & string, string> = {
  concepts: "Generating concepts",
  "learning-path": "Building learning path",
  resources: "Discovering resources",
  done: "Finishing up",
};

interface GeneratingCardProps {
  data: UserRoadmapDto;
  onComplete?: () => void;
}

export function GeneratingCard({ data, onComplete }: GeneratingCardProps) {
  const { roadmap } = data;
  const isFailed = roadmap.generationStatus === "failed";
  const hasNotified = useRef(false);

  const { status, stage } = useRoadmapEvents(isFailed ? null : roadmap.id);

  useEffect(() => {
    const isDone =
      status === "completed" ||
      (status === "processing" && stage === "learning-path");
    if (isDone && !hasNotified.current) {
      hasNotified.current = true;
      onComplete?.();
    } else if (!isDone) {
      hasNotified.current = false;
    }
  }, [status, stage, onComplete]);

  const tone = isFailed ? "fail" : "proc";
  const label = isFailed
    ? "Failed"
    : (stage && STAGE_LABEL[stage]) || "Starting";
  const currentIndex = stage ? (STAGE_INDEX[stage] ?? 0) : 0;

  return (
    <Card variant="aurora" accent={toneColor(tone)}>
      <Card.Zone>
        <Card.ZoneCat icon={<Sparkles size={13} />}>Generating</Card.ZoneCat>
        <StatusPill tone={tone} label={label} pulse={!isFailed} />
      </Card.Zone>

      <Card.Body>
        <Card.Head>
          <Card.Icon>
            {isFailed ? <AlertCircle size={22} /> : <Sparkles size={22} />}
          </Card.Icon>
          <Card.HeadText>
            <Card.Title>{roadmap.title}</Card.Title>
          </Card.HeadText>
        </Card.Head>

        {!isFailed && (
          <Pipeline
            stages={GENERATION_STAGES}
            currentIndex={currentIndex}
            tone="proc"
          />
        )}

        {isFailed && roadmap.errorMessage && (
          <Card.FailNote icon={<AlertCircle size={14} />}>
            {roadmap.errorMessage}
          </Card.FailNote>
        )}
      </Card.Body>
    </Card>
  );
}
