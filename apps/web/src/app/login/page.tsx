import { LoginPage, GuestGuard } from '@/features/auth/components';

export default function Page() {
  return (
    <GuestGuard>
      <LoginPage />
    </GuestGuard>
  );
}
