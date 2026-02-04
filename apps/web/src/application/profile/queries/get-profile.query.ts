import { useGetProfileQuery as useGetProfileQueryBase } from '@/infrastructure/api/authApi';

export function useGetProfileQuery() {
  const { data: user, isLoading, error, refetch } = useGetProfileQueryBase();

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}
