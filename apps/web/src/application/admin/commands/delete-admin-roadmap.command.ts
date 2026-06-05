"use client";

import { useDeleteAdminRoadmapMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useDeleteAdminRoadmapCommand = () =>
  useCommand(useDeleteAdminRoadmapMutation);
