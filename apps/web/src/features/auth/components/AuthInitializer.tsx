'use client';

import { useProfileQuery } from '@/application/auth/queries/get-profile.query';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useProfileQuery();
  return <>{children}</>;
}
