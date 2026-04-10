"use client";

import { Divider } from "@mui/material";
import type { FormDividerProps } from "./Form.types";

export function FormDivider({ children = "or" }: FormDividerProps) {
  return (
    <Divider sx={{ my: 3, color: "text.secondary", fontSize: "0.875rem" }}>
      {children}
    </Divider>
  );
}
