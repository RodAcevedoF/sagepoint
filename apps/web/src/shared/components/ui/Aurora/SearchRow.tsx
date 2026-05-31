"use client";

import { Box } from "@mui/material";
import type { CSSProperties, ReactNode } from "react";

interface SearchRowProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function SearchRow({ children, style }: SearchRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "14px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
      style={style}
    >
      {children}
    </Box>
  );
}
