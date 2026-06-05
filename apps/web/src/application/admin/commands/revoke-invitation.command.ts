"use client";

import { useRevokeInvitationMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useRevokeInvitationCommand = () =>
  useCommand(useRevokeInvitationMutation);
