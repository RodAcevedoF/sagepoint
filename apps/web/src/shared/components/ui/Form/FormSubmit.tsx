"use client";

import { Box } from "@mui/material";
import { useFormStatus } from "react-dom";
import { Button } from "../Button";
import { ButtonVariants, ButtonTypes } from "@/shared/types";
import type { FormSubmitProps } from "./Form.types";

export function FormSubmit({ children, fullWidth = true }: FormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Box sx={{ mt: 4, mb: 3 }}>
      <Button
        type={ButtonTypes.SUBMIT}
        variant={ButtonVariants.AURORA}
        fullWidth={fullWidth}
        disabled={pending}
        loading={pending}
        label={children}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          justifyContent: "center",
        }}
      />
    </Box>
  );
}
