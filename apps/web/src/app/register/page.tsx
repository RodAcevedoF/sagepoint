import { RegisterPage, GuestGuard } from '@/features/auth/components';

export default function Page() {
  return (
    <GuestGuard>
      <RegisterPage />
    </GuestGuard>
  );
}
