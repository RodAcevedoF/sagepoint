"use client";

import { Box, Typography, alpha, useTheme } from "@mui/material";

export interface FilterChipOption<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

interface FilterChipsProps<T extends string = string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string = string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 2,
              py: 0.9,
              borderRadius: 2.5,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.925rem",
              letterSpacing: "0.01em",
              transition: "all 0.2s ease",
              border: `1.5px solid ${alpha(
                isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                isActive ? 0.4 : 0.12,
              )}`,
              bgcolor: isActive
                ? alpha(theme.palette.primary.main, 0.12)
                : alpha(theme.palette.background.paper, 0.3),
              color: isActive
                ? theme.palette.primary.light
                : theme.palette.text.secondary,
              backdropFilter: "blur(6px)",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.light,
                transform: "translateY(-1px)",
              },
            }}
          >
            {option.label}
            {option.count != null && (
              <Typography
                component="span"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1.5,
                  bgcolor: alpha(
                    isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    0.15,
                  ),
                  color: isActive
                    ? theme.palette.primary.light
                    : theme.palette.text.secondary,
                }}
              >
                {option.count}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
