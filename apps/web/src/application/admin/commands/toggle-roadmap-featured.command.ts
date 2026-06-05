"use client";

import { useToggleRoadmapFeaturedMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useToggleRoadmapFeaturedCommand = () =>
  useCommand(useToggleRoadmapFeaturedMutation);
