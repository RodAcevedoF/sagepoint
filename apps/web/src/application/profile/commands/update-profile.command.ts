import { useUpdateProfileMutation } from '@/infrastructure/api/userApi';
import { UpdateUserDto } from '@/infrastructure/api/userApi';

export function useUpdateProfileCommand() {
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const execute = async (data: UpdateUserDto) => {
    return await updateProfile(data).unwrap();
  };

  return {
    execute,
    isLoading,
    error,
  };
}
