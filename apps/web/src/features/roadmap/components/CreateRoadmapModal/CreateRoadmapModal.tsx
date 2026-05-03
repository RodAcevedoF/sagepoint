"use client";

import { useState, useCallback } from "react";
import { useModal } from "@/shared/components";
import { useGenerateTopicRoadmapCommand } from "@/application/roadmap";
import { useGetResourceQuotaQuery } from "@/infrastructure/api/userApi";
import { normalizeTopicInput } from "../../utils/roadmap.utils";
import {
  COMMITMENT_LEVELS,
  type CommitmentLevel,
} from "../Category/CommitmentLevelSelector";
import { type ExperienceLevel } from "../ExperienceLevelSelector";
import { GenerationForm } from "../forms/GenerationForm";

interface CreateRoadmapModalProps {
  onCreated?: (roadmapId: string) => void;
}

export function CreateRoadmapModal({ onCreated }: CreateRoadmapModalProps) {
  const { closeModal } = useModal();
  const { execute, isLoading } = useGenerateTopicRoadmapCommand();
  const { data: quota } = useGetResourceQuotaQuery();
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    ExperienceLevel | undefined
  >();
  const [commitment, setCommitment] = useState<CommitmentLevel | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roadmapLimitReached =
    quota !== undefined &&
    quota.balance !== null &&
    quota.balance < quota.costs.TOPIC_ROADMAP;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!topic.trim()) return;

      setErrorMessage(null);
      const normalizedTopic = normalizeTopicInput(topic);
      const timeAvailable = commitment
        ? COMMITMENT_LEVELS.find((c) => c.id === commitment)?.hours
        : undefined;

      const result = await execute(normalizedTopic, title.trim() || undefined, {
        userContext:
          experienceLevel || timeAvailable
            ? { experienceLevel, timeAvailable }
            : undefined,
      });

      if (result.ok) {
        closeModal();
        onCreated?.(result.data.id);
      } else {
        setErrorMessage(
          result.error.tag === "ROADMAP_LIMIT"
            ? "Not enough tokens. Contact your administrator to get more."
            : "Something went wrong generating your roadmap. Please try again.",
        );
      }
    },
    [topic, title, experienceLevel, commitment, execute, closeModal, onCreated],
  );

  return (
    <GenerationForm
      topic={topic}
      title={title}
      experienceLevel={experienceLevel}
      commitment={commitment}
      isLoading={isLoading}
      limitReached={roadmapLimitReached ?? false}
      errorMessage={errorMessage}
      quota={quota}
      onTopicChange={setTopic}
      onTitleChange={setTitle}
      onExperienceLevelChange={setExperienceLevel}
      onCommitmentChange={setCommitment}
      onSubmit={handleSubmit}
    />
  );
}
