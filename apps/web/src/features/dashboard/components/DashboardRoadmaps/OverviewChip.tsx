import { Box, Typography, alpha } from "@mui/material";

interface OverviewChipProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export function OverviewChip({ count, label, icon, color }: OverviewChipProps) {
  if (count === 0) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.6,
        borderRadius: "999px",
        bgcolor: alpha(color, 0.14),
        border: `1px solid ${alpha(color, 0.28)}`,
        color,
      }}
    >
      {icon}
      <Typography variant="caption" fontWeight={700} sx={{ color }}>
        {count} {label}
      </Typography>
    </Box>
  );
}
