"use client";

import { useRefreshResourcesMutation } from "@/infrastructure/api/roadmapApi";
import { useCommand } from "@/application/common";

export const useRefreshResourcesCommand = () =>
  useCommand(useRefreshResourcesMutation);
