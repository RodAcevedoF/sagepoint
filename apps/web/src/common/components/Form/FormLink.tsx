"use client";

import { Box, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { palette } from "@/common/theme";
import type { FormLinkProps } from "./Form.types";

export function FormLink({ href, children }: FormLinkProps) {
  return (
    <Box display="flex" justifyContent="center">
      <MuiLink
        component={Link}
        href={href}
        variant="body2"
        underline="hover"
        sx={{
          color: palette.primary.light,
          fontWeight: 600,
        }}
      >
        {children}
      </MuiLink>
    </Box>
  );
}
