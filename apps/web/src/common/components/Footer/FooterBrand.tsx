'use client';

import { Box, Typography, SxProps, Theme } from '@mui/material';
import { palette } from '@/common/theme';

const styles = {
  brand: {
    background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    maxWidth: 280,
  },
} satisfies Record<string, SxProps<Theme>>;

export function FooterBrand() {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={styles.brand}>
        SagePoint
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={styles.description}>
        AI-powered learning roadmaps from your own documents.
      </Typography>
    </Box>
  );
}
