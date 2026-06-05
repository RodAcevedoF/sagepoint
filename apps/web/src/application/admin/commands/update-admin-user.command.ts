"use client";

import { useUpdateAdminUserMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useUpdateAdminUserCommand = () =>
  useCommand(useUpdateAdminUserMutation);
