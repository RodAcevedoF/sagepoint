import { type Theme, alpha } from "@mui/material";

export const makeStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    gap: 0.75,
    mb: 4,
    flexWrap: "wrap",
  },
  chip: (isSelected: boolean) => ({
    fontWeight: 600,
    fontSize: "0.8rem",
    py: 0.25,
    bgcolor: isSelected
      ? alpha(theme.palette.primary.main, 0.15)
      : "transparent",
    color: isSelected
      ? theme.palette.primary.light
      : theme.palette.text.secondary,
    border: `1px solid ${alpha(
      isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
      isSelected ? 0.3 : 0.15,
    )}`,
    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
    transition: "all 0.2s ease",
  }),
  count: (isSelected: boolean) => ({
    fontSize: "0.7rem",
    fontWeight: 700,
    ml: 0.5,
    px: 0.75,
    py: 0.125,
    borderRadius: 1,
    bgcolor: alpha(
      isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
      0.15,
    ),
    color: isSelected
      ? theme.palette.primary.light
      : theme.palette.text.secondary,
    lineHeight: 1.3,
  }),
});
