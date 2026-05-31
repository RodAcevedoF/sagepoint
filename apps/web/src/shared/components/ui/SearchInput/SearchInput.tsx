"use client";

import { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  fullWidth?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  fullWidth = true,
}: SearchInputProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue.trim());
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size="small"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={auroraPalette.txLow} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label="Clear search"
                sx={{ p: 0.5 }}
              >
                <X size={16} color={auroraPalette.txLow} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: auroraPalette.radii.pill,
          bgcolor: "oklch(0.22 0.025 262 / 0.5)",
          color: auroraPalette.txHi,
          "& fieldset": {
            borderColor: auroraPalette.line,
          },
          "&:hover fieldset": {
            borderColor: auroraPalette.line2,
          },
          "&.Mui-focused fieldset": {
            borderColor: auroraTint(auroraPalette.teal, 0.5),
          },
        },
        "& .MuiOutlinedInput-input::placeholder": {
          color: auroraPalette.txLow,
          opacity: 1,
        },
      }}
    />
  );
}
