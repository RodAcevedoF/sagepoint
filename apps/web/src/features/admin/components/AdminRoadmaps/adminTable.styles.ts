import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";

export const adminTableStyles = {
  headerCell: {
    color: palette.text.secondary,
    fontWeight: 700,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    py: 2,
    borderBottom: `1px solid ${alpha(palette.divider, 0.1)}`,
  },
  row: {
    "&:hover": {
      bgcolor: alpha(palette.primary.main, 0.04),
    },
    transition: "background-color 0.2s ease",
  },
  filterBar: {
    display: "flex",
    gap: 2,
    mb: 2,
    flexWrap: "wrap",
    alignItems: "center",
  },
} as const;
