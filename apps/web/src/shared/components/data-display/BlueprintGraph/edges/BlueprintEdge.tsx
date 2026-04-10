"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useTheme, alpha } from "@mui/material/styles";
import type { BlueprintEdgeData } from "../BlueprintGraph.types";

function getEdgeColor(
  accent: string,
  info: string,
  secondary: string,
  edgeType?: string,
): string {
  switch (edgeType) {
    case "related":
      return info;
    case "same_as":
      return secondary;
    default:
      return accent;
  }
}

function BlueprintEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const theme = useTheme();
  const edgeData = data as BlueprintEdgeData | undefined;
  const isDimmed = edgeData?._dimmed ?? false;
  const baseColor = getEdgeColor(
    alpha(theme.palette.accent, 0.5),
    alpha(theme.palette.info.light, 0.5),
    alpha(theme.palette.secondary.light, 0.5),
    edgeData?.type,
  );
  const color = isDimmed ? alpha(baseColor, 0.15) : baseColor;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: 1.5,
          strokeDasharray: "6 4",
          transition: "stroke 0.3s",
        }}
      />
      {!isDimmed && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          style={{
            animation: "blueprintDash 1.5s linear infinite",
          }}
        />
      )}
      <style>{`
        @keyframes blueprintDash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </>
  );
}

export const BlueprintEdge = memo(BlueprintEdgeComponent);
