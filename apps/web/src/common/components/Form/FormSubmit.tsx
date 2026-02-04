"use client";

import { useFormStatus } from "react-dom";
import { Button, CircularProgress, alpha } from "@mui/material";
import { palette } from "@/common/theme";
import type { FormSubmitProps } from "./Form.types";

export function FormSubmit({ children, fullWidth = true }: FormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      fullWidth={fullWidth}
      variant="contained"
      disabled={pending}
      sx={{
        mt: 4,
        mb: 3,
        py: 1.5,
        fontWeight: "bold",
        fontSize: "1rem",
        borderRadius: 2,
        background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.light} 100%)`,
        boxShadow: `0 4px 14px 0 ${alpha(palette.primary.main, 0.39)}`,
        "&:hover": {
          background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 100%)`,
        },
      }}
    >
      {pending ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}
