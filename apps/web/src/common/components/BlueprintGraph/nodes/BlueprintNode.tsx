"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { useTheme, alpha } from "@mui/material/styles";
import { CheckCircle2, Play, SkipForward, Circle } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import type {
  BlueprintNodeData,
  BlueprintNodeStatus,
} from "../BlueprintGraph.types";
import {
  makeStyles,
  getDifficultyColor,
  getStatusColor,
} from "./BlueprintNode.styles";

function StatusIcon({
  status,
  color,
}: {
  status: BlueprintNodeStatus;
  color: string;
}) {
  const size = 14;
  switch (status) {
    case "completed":
      return <CheckCircle2 size={size} color={color} />;
    case "active":
      return <Play size={size} color={color} fill={color} />;
    case "skipped":
      return <SkipForward size={size} color={color} />;
    default:
      return <Circle size={size} color={color} />;
  }
}

function BlueprintNodeComponent({ data }: NodeProps) {
  const theme = useTheme();
  const nodeData = data as BlueprintNodeData;
  const status = nodeData.status ?? "default";
  const styles = makeStyles(theme, status);
  const statusColor = getStatusColor(theme, status);

  const difficultyColor = nodeData.difficulty
    ? getDifficultyColor(theme, nodeData.difficulty)
    : null;

  return (
    <>
      <Handle type="target" position={Position.Top} style={styles.handle} />
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {nodeData.order !== undefined && (
            <div
              style={{
                fontSize: 9,
                fontFamily: '"JetBrains Mono", monospace',
                color: alpha(theme.palette.text.secondary, 0.5),
                letterSpacing: "0.1em",
              }}
            >
              STEP {nodeData.order}
            </div>
          )}
          <StatusIcon status={status} color={statusColor} />
        </div>
        <div style={{ ...styles.label, marginTop: 4 }}>{nodeData.label}</div>
        {nodeData.description && (
          <div style={styles.description}>{nodeData.description}</div>
        )}
        {difficultyColor && (
          <span
            style={{
              ...styles.badge,
              color: difficultyColor,
              background: alpha(difficultyColor, 0.12),
            }}
          >
            {nodeData.difficulty}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={styles.handle} />
    </>
  );
}

export const BlueprintNode = memo(BlueprintNodeComponent);
