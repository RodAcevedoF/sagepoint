"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { Coins } from "lucide-react";

interface TokenBalanceDisplayProps {
  balance: number | null;
  cost?: number;
  costLabel?: string;
}

export function ResourceQuotaBar({
  balance,
  cost,
  costLabel,
}: TokenBalanceDisplayProps) {
  const theme = useTheme();
  const isUnlimited = balance === null;
  const isEmpty = !isUnlimited && balance === 0;
  const canAfford =
    isUnlimited || (cost === undefined ? true : balance! >= cost);

  const balanceColor = isEmpty
    ? theme.palette.error.main
    : !canAfford
      ? theme.palette.warning.main
      : theme.palette.success.main;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(balanceColor, 0.25)}`,
        bgcolor: alpha(balanceColor, 0.06),
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <Coins size={14} color={balanceColor} />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            Token balance
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: balanceColor, fontWeight: 700, fontSize: "0.75rem" }}
        >
          {isUnlimited ? "Unlimited" : balance}
        </Typography>
      </Stack>

      {cost !== undefined && costLabel && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: canAfford ? "text.disabled" : theme.palette.warning.main,
            fontSize: "0.65rem",
          }}
        >
          {costLabel} costs {cost} token{cost !== 1 ? "s" : ""}
          {!isUnlimited && !canAfford && " — insufficient balance"}
        </Typography>
      )}

      {isEmpty && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: "error.main",
            fontSize: "0.65rem",
          }}
        >
          No tokens remaining. Contact your administrator.
        </Typography>
      )}
    </Box>
  );
}
