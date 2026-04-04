"use client";

import { useToggleLikeMutation } from "@/infrastructure/api/socialApi";

export function useToggleLikeCommand() {
  return useToggleLikeMutation();
}
