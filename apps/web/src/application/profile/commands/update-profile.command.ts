import { useUpdateProfileMutation } from "@/infrastructure/api/userApi";
import { useCommand } from "@/application/common";

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
  learningGoal?: string;
  interests?: string[];
}

export const useUpdateProfileCommand = () =>
  useCommand(useUpdateProfileMutation);
