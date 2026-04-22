"use client";

import { useDeleteDocumentMutation } from "@/infrastructure/api/documentApi";
import { useCommand } from "@/application/common";

export const useDeleteDocumentCommand = () =>
  useCommand(useDeleteDocumentMutation);
