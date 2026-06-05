"use client";

import { useCreateInvitationMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useCreateInvitationCommand = () =>
  useCommand(useCreateInvitationMutation);
