import { useUpdateProfileMutation } from "@/infrastructure/api/userApi";

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
  learningGoal?: string;
  interests?: string[];
}

export function useUpdateProfileCommand() {
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const execute = async (data: UpdateProfileInput) => {
    return await updateProfile(data).unwrap();
  };

  return {
    execute,
    isLoading,
    error,
  };
}
