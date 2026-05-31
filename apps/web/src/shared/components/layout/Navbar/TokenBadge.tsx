"use client";

import { Box, Tooltip } from "@mui/material";
import { Coins, Infinity as InfinityIcon } from "lucide-react";
import { aurora, auroraTint } from "@/shared/theme";
import { useGetResourceQuotaQuery } from "@/infrastructure/api/userApi";

export function TokenBadge() {
  const { data: quota } = useGetResourceQuotaQuery();

  const isUnlimited = quota?.balance === null;
  const isLow =
    quota !== undefined &&
    quota.balance !== null &&
    quota.balance < (quota.costs?.DOCUMENT_UPLOAD ?? 10);

  const accent = isLow ? aurora.status.fail : aurora.status.proc;

  const label =
    quota === undefined ? (
      "…"
    ) : isUnlimited ? (
      <InfinityIcon size={14} strokeWidth={2.2} />
    ) : (
      String(quota.balance)
    );

  return (
    <Tooltip
      title={
        isUnlimited
          ? "Unlimited tokens"
          : `${quota?.balance ?? "…"} tokens remaining`
      }
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "6px 11px",
          borderRadius: 999,
          border: `1px solid ${auroraTint(accent, 0.4)}`,
          background: auroraTint(accent, 0.08),
          color: accent,
          fontFamily: aurora.font.mono,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          cursor: "default",
        }}
      >
        <Coins size={14} strokeWidth={2.2} />
        {label}
      </Box>
    </Tooltip>
  );
}
