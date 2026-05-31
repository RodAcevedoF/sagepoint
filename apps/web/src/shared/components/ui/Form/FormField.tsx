"use client";

import { TextField } from "@mui/material";
import { aurora, auroraTint } from "@/shared/theme";
import type { FormFieldProps } from "./Form.types";

export function FormField({
  name,
  label,
  type = "text",
  required = false,
  disabled = false,
  autoFocus = false,
  autoComplete,
  defaultValue = "",
  multiline = false,
  rows,
  placeholder,
}: FormFieldProps) {
  return (
    <TextField
      margin="normal"
      required={required}
      disabled={disabled}
      fullWidth
      id={name}
      label={label}
      name={name}
      type={type}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      defaultValue={defaultValue}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: aurora.radii.md,
          background: aurora.surface,
          color: aurora.txHi,
          fontFamily: aurora.font.ui,
          transition:
            "background-color .2s ease, border-color .2s ease, box-shadow .2s ease",
          "& fieldset": {
            borderColor: aurora.line,
            transition: "border-color .2s ease",
          },
          "&:hover": {
            background: aurora.surface2,
            "& fieldset": { borderColor: aurora.line2 },
          },
          "&.Mui-focused": {
            background: aurora.surface2,
            boxShadow: `0 0 0 4px ${auroraTint(aurora.teal, 0.18)}`,
            "& fieldset": { borderColor: aurora.teal, borderWidth: "1px" },
          },
          "&.Mui-disabled": {
            background: aurora.surface,
            color: aurora.txLow,
            "& fieldset": { borderColor: aurora.line },
          },
        },
        "& .MuiInputBase-input": {
          color: aurora.txHi,
          "&::placeholder": { color: aurora.txLow, opacity: 1 },
          "&.Mui-disabled": {
            WebkitTextFillColor: aurora.txLow,
          },
        },
        "& .MuiInputLabel-root": {
          color: aurora.txLow,
          fontFamily: aurora.font.ui,
          "&.Mui-focused": { color: aurora.teal },
        },
      }}
    />
  );
}
