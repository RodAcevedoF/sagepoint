"use client";

import { useDeleteAdminDocumentMutation } from "@/infrastructure/api/adminApi";
import { useCommand } from "@/application/common";

export const useDeleteAdminDocumentCommand = () =>
  useCommand(useDeleteAdminDocumentMutation);
