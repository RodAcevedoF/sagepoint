"use client";

import { useUpdateUserLimitsMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useUpdateUserLimitsCommand = () =>
  useCommand(useUpdateUserLimitsMutation);
