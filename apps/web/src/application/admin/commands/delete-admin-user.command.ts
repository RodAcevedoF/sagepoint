"use client";

import { useDeleteAdminUserMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useDeleteAdminUserCommand = () =>
  useCommand(useDeleteAdminUserMutation);
