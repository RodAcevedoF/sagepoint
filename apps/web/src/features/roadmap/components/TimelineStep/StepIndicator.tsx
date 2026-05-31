"use client";

import { Box } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import { StepStatus } from "@sagepoint/domain";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

interface StepIndicatorProps {
  order: number;
  status: StepStatus;
  isOpen: boolean;
}

export function StepIndicator({ order, status, isOpen }: StepIndicatorProps) {
  const isCompleted = status === StepStatus.COMPLETED;
  const isActive = status === StepStatus.IN_PROGRESS;

  let background: string = "oklch(0.22 0.026 262)";
  let borderColor: string = auroraPalette.line2;
  let color: string = auroraPalette.txMid;
  let boxShadow: string = "none";

  if (isCompleted) {
    background = auroraPalette.status.ready;
    borderColor = auroraPalette.status.ready;
    color = auroraPalette.tealInk;
  } else if (isOpen || isActive) {
    borderColor = auroraPalette.teal;
    color = auroraPalette.teal;
    boxShadow = `0 0 16px -2px ${auroraTint(auroraPalette.teal, 0.5)}`;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        left: "-26px",
        top: "22px",
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontFamily: auroraPalette.font.mono,
        fontWeight: 700,
        fontSize: "14px",
        background,
        border: `2px solid ${borderColor}`,
        color,
        zIndex: 2,
        transition: "all .2s",
        boxShadow,
      }}
    >
      {isCompleted ? <CheckCircle2 size={18} /> : order}
    </Box>
  );
}
