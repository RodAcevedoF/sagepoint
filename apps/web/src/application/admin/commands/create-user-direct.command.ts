"use client";

import { useCreateUserDirectMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useCreateUserDirectCommand = () =>
  useCommand(useCreateUserDirectMutation);
