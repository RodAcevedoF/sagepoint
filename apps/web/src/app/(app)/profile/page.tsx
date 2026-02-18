import { Metadata } from 'next';
import { ProfilePage } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Profile | SagePoint',
  description: 'Manage your profile and settings',
};

export default function Page() {
  return <ProfilePage />;
}
