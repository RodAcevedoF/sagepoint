"use client";

import {
  Box,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { getUsageColor, getRemainingLabel } from "@/shared/utils/resourceQuota";

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
  const pct = Math.min(100, (used / max) * 100);
  const barColor = getUsageColor(pct, theme);
  const { text: remainingText, color: remainingColor } = getRemainingLabel(
    remaining,
    max,
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 10,
            background: alpha(
              remaining === 0
                ? theme.palette.error.main
                : pct >= 75
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
              0.12,
            ),
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: remainingColor, fontWeight: 700, fontSize: "0.7rem" }}
          >
            {remainingText}
          </Typography>
        </Box>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(barColor, 0.12),
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            bgcolor: barColor,
            transition: "background-color 0.3s ease",
          },
        }}
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", fontSize: "0.65rem" }}
        >
          {used} of {max} used
        </Typography>
      </Stack>

      {remaining === 0 && limitReachedMessage && (
        <Typography
          variant="caption"
          sx={{ color: "error.main", mt: 0.5, display: "block" }}
        >
          {limitReachedMessage}
        </Typography>
      )}
    </Box>
  );
}
