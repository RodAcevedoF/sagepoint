"use client";

import { TextField } from "@mui/material";
import type { FormFieldProps } from "./Form.types";

export function FormField({
  name,
  label,
  type = "text",
  required = false,
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
          borderRadius: 2,
        },
      }}
    />
  );
}
