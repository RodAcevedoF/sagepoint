'use client';

import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components';
import { ButtonVariants, ButtonSizes } from '@/common/types';

export function HeroActions() {
  const router = useRouter();

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
      <Button
        label="Get Started Free"
        size={ButtonSizes.LARGE}
        onClick={() => router.push('/register')}
      />
      <Button
        label="Sign In"
        variant={ButtonVariants.OUTLINED}
        size={ButtonSizes.LARGE}
        onClick={() => router.push('/login')}
      />
    </Stack>
  );
}
