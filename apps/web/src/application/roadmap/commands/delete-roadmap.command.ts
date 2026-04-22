"use client";

import { useDeleteRoadmapMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export const useDeleteRoadmapCommand = () =>
  useCommand(useDeleteRoadmapMutation);
