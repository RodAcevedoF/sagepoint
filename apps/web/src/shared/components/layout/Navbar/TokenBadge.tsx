"use client";

import { Chip, Tooltip, alpha, useTheme } from "@mui/material";
import { Coins, Infinity as InfinityIcon } from "lucide-react";
import { useGetResourceQuotaQuery } from "@/infrastructure/api/userApi";

export function TokenBadge() {
  const theme = useTheme();
  const { data: quota } = useGetResourceQuotaQuery();

  const label =
    quota === undefined ? (
      "…"
    ) : quota.balance === null ? (
      <InfinityIcon size={18} />
    ) : (
      String(quota.balance)
    );

  const isLow =
    quota !== undefined &&
    quota.balance !== null &&
    quota.balance < (quota.costs?.DOCUMENT_UPLOAD ?? 10);

  return (
    <Tooltip
      title={
        quota?.balance === null
          ? "Unlimited tokens"
          : `${quota?.balance ?? "…"} tokens remaining`
      }
    >
      <Chip
        icon={<Coins size={18} />}
        label={label}
        size="small"
        sx={{
          height: 38,
          fontSize: "0.75rem",
          fontWeight: 700,
          cursor: "default",
          bgcolor: isLow
            ? alpha(theme.palette.error.main, 0.2)
            : alpha(theme.palette.warning.main, 0.18),
          color: isLow
            ? theme.palette.error.light
            : theme.palette.warning.light,
          border: `1.5px solid ${isLow ? alpha(theme.palette.error.main, 0.5) : alpha(theme.palette.warning.main, 0.5)}`,
          boxShadow: isLow
            ? `0 0 8px ${alpha(theme.palette.error.main, 0.2)}`
            : `0 0 8px ${alpha(theme.palette.warning.main, 0.2)}`,
          "& .MuiChip-icon": {
            color: "inherit",
            ml: "10px",
          },
          "& .MuiChip-label": {
            px: "10px",
          },
        }}
      />
    </Tooltip>
  );
}
