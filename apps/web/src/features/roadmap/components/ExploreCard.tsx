"use client";

import { Clock, BookOpen, Map, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  MixBar,
  Pill,
  StatusPill,
  difficultySegments,
  toneColor,
  type AuroraTone,
} from "@/shared/components";
import {
  formatDuration,
  formatPace,
  formatRelativeTime,
  getDifficultyDistribution,
} from "../utils/roadmap.utils";
import { LikeButton } from "./LikeButton";
import type { RoadmapDto } from "@/infrastructure/api/roadmapApi";

interface ExploreCardProps {
  roadmap: RoadmapDto;
  tone?: AuroraTone;
}

export function ExploreCard({ roadmap, tone = "teal" }: ExploreCardProps) {
  const router = useRouter();
  const difficultyDist = getDifficultyDistribution(roadmap.steps);
  const category = roadmap.categoryName ?? "Roadmap";
  const open = () => router.push(`/roadmaps/${roadmap.id}`);

  return (
    <Card variant="aurora" accent={toneColor(tone)} onClick={open}>
      <Card.Zone>
        <Card.ZoneCat icon={<Map size={13} />}>{category}</Card.ZoneCat>
        <StatusPill tone="ready" label="Public" />
      </Card.Zone>

      <Card.Body>
        <Card.Head>
          <Card.HeadText>
            <Card.Title>{roadmap.title}</Card.Title>
          </Card.HeadText>
        </Card.Head>

        {roadmap.description && <Card.Desc>{roadmap.description}</Card.Desc>}

        <Card.DataRow>
          <Card.DataCell label="Steps" icon={<BookOpen size={15} />}>
            {roadmap.steps.length} steps
          </Card.DataCell>
          <Card.DataCell label="Duration" icon={<Clock size={15} />}>
            {formatDuration(roadmap.totalEstimatedDuration)}
          </Card.DataCell>
        </Card.DataRow>

        {Object.keys(difficultyDist).length > 0 && (
          <MixBar segments={difficultySegments(difficultyDist)} />
        )}
      </Card.Body>

      <Card.Foot>
        <Card.FootLeft>
          {roadmap.recommendedPace && (
            <Pill tone="concept" icon={<Calendar size={13} />}>
              {formatPace(roadmap.recommendedPace)}
            </Pill>
          )}
          <Card.FootDate>{formatRelativeTime(roadmap.createdAt)}</Card.FootDate>
        </Card.FootLeft>
        <Card.Actions>
          <LikeButton roadmapId={roadmap.id} compact />
        </Card.Actions>
      </Card.Foot>
    </Card>
  );
}
