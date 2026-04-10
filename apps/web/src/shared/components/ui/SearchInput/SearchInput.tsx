"use client";

import { useState } from "react";
import { TextField, InputAdornment, IconButton, alpha } from "@mui/material";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { palette } from "@/shared/theme";

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
              <Search size={18} color={palette.text.secondary} />
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
                <X size={16} color={palette.text.secondary} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          bgcolor: alpha(palette.background.paper, 0.4),
          backdropFilter: "blur(8px)",
          "& fieldset": {
            borderColor: alpha(palette.primary.light, 0.1),
          },
          "&:hover fieldset": {
            borderColor: alpha(palette.primary.light, 0.25),
          },
          "&.Mui-focused fieldset": {
            borderColor: alpha(palette.primary.main, 0.4),
          },
        },
      }}
    />
  );
}
