"use client";

import {
  Box,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

interface ResourceQuotaBarProps {
  used: number;
  max: number;
  remaining: number;
  label: string;
  limitReachedMessage?: string;
}

export function ResourceQuotaBar({
  used,
  max,
  remaining,
  label,
  limitReachedMessage,
}: ResourceQuotaBarProps) {
  const theme = useTheme();
  const limitReached = remaining === 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {used} / {max}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, (used / max) * 100)}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            bgcolor: limitReached
              ? theme.palette.error.main
              : theme.palette.primary.main,
          },
        }}
      />
      {limitReached && limitReachedMessage && (
        <Typography
          variant="caption"
          sx={{ color: theme.palette.error.main, mt: 0.5, display: "block" }}
        >
          {limitReachedMessage}
        </Typography>
      )}
    </Box>
  );
}
