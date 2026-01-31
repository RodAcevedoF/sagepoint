'use client';

import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/Button';
import { ButtonVariants } from '@/common/types';

export function NavbarActions() {
  const router = useRouter();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        label="Sign In"
        variant={ButtonVariants.GHOST}
        onClick={() => router.push('/login')}
      />
      <Button
        label="Get Started"
        variant={ButtonVariants.DEFAULT}
        onClick={() => router.push('/register')}
      />
    </Stack>
  );
}
