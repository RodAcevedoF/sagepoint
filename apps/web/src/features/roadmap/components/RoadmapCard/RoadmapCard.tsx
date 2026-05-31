"use client";

import { useState } from "react";
import {
  Clock,
  BookOpen,
  ArrowRight,
  Globe,
  Lock,
  Trash2,
  Map,
  Calendar,
} from "lucide-react";
import { RoadmapVisibility } from "@sagepoint/domain";
import {
  useUpdateVisibilityCommand,
  useDeleteRoadmapCommand,
} from "@/application/roadmap";
import { useRouter } from "next/navigation";
import {
  Card,
  AuroraIconButton,
  ConfirmDialog,
  difficultySegments,
  MixBar,
  Pill,
  ProgressRing,
  StatusPill,
  toneColor,
  useSnackbar,
  type AuroraTone,
} from "@/shared/components";

import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
import {
  formatDuration,
  formatPace,
  formatRelativeTime,
  getDifficultyDistribution,
  getStatus,
} from "../../utils/roadmap.utils";

const STATUS_TONE: Record<string, AuroraTone> = {
  Completed: "ready",
  "In Progress": "proc",
  New: "teal",
};

interface RoadmapCardProps {
  data: UserRoadmapDto;
}

export function RoadmapCard({ data }: RoadmapCardProps) {
  const router = useRouter();
  const { roadmap, progress } = data;
  const status = getStatus(progress);
  const tone = STATUS_TONE[status.label] ?? "teal";
  const difficultyDist = getDifficultyDistribution(roadmap.steps);
  const { execute: updateVisibility } = useUpdateVisibilityCommand();
  const { execute: deleteRoadmap } = useDeleteRoadmapCommand();
  const { showSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPublic = roadmap.visibility === RoadmapVisibility.PUBLIC;
  const category = roadmap.categoryName ?? "Roadmap";

  const open = () => router.push(`/roadmaps/${roadmap.id}`);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    const result = await deleteRoadmap(roadmap.id);
    if (result.ok) showSnackbar("Roadmap deleted", { severity: "success" });
    else showSnackbar("Failed to delete roadmap", { severity: "error" });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateVisibility(
      roadmap.id,
      isPublic ? RoadmapVisibility.PRIVATE : RoadmapVisibility.PUBLIC,
    );
  };

  return (
    <>
      <Card variant="aurora" accent={toneColor(tone)} onClick={open}>
        <Card.Zone>
          <Card.ZoneCat icon={<Map size={13} />}>{category}</Card.ZoneCat>
          <StatusPill tone={tone} label={status.label} />
        </Card.Zone>

        <Card.Body>
          <Card.Head>
            <Card.HeadText>
              <Card.Title>{roadmap.title}</Card.Title>
            </Card.HeadText>
            <ProgressRing value={progress.progressPercentage} />
          </Card.Head>

          {roadmap.description && <Card.Desc>{roadmap.description}</Card.Desc>}

          <Card.DataRow>
            <Card.DataCell label="Steps" icon={<BookOpen size={15} />}>
              {progress.completedSteps}/{progress.totalSteps} steps
            </Card.DataCell>
            <Card.DataCell label="Duration" icon={<Clock size={15} />}>
              {formatDuration(roadmap.totalEstimatedDuration)}
            </Card.DataCell>
          </Card.DataRow>

          <MixBar segments={difficultySegments(difficultyDist)} />
        </Card.Body>

        <Card.Foot>
          <Card.FootLeft>
            {roadmap.recommendedPace && (
              <Pill tone="concept" icon={<Calendar size={13} />}>
                {formatPace(roadmap.recommendedPace)}
              </Pill>
            )}
            <Card.FootDate>
              {formatRelativeTime(roadmap.createdAt)}
            </Card.FootDate>
          </Card.FootLeft>
          <Card.Actions>
            <AuroraIconButton
              ariaLabel={isPublic ? "Public" : "Private"}
              title={
                isPublic
                  ? "Public — click to make private"
                  : "Private — click to share publicly"
              }
              onClick={handleToggleVisibility}
            >
              {isPublic ? <Globe size={16} /> : <Lock size={16} />}
            </AuroraIconButton>
            <AuroraIconButton
              ariaLabel="Delete"
              title="Delete roadmap"
              onClick={handleDeleteClick}
            >
              <Trash2 size={16} />
            </AuroraIconButton>
            <AuroraIconButton
              ariaLabel="Open"
              title="Open"
              go
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              <ArrowRight size={18} />
            </AuroraIconButton>
          </Card.Actions>
        </Card.Foot>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Roadmap"
        description={
          <>
            Are you sure you want to delete <strong>{roadmap.title}</strong>?
            All progress and quiz data will be lost. This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
