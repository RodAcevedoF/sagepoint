"use client";

import { Box, keyframes } from "@mui/material";
import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
}

const shimmer = keyframes`
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
`;

export function Skeleton({
  width,
  height,
  radius,
  style,
  className,
}: SkeletonProps) {
  return (
    <Box
      component="span"
      className={className}
      sx={{
        display: "block",
        background:
          "linear-gradient(90deg, oklch(0.27 0.02 262 / 0.4) 25%, oklch(0.33 0.02 262 / 0.6) 37%, oklch(0.27 0.02 262 / 0.4) 63%)",
        backgroundSize: "280% 100%",
        animation: `${shimmer} 1.5s ease-in-out infinite`,
        borderRadius: "7px",
      }}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
