import { alpha, type Theme } from "@mui/material/styles";

export const makeStyles = (theme: Theme, allDone: boolean) => ({
  container: {
    mt: 1,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.secondary.light, 0.15)}`,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    px: 2,
    py: 1,
    cursor: "pointer",
    transition: "background-color 0.15s",
    "&:hover": {
      bgcolor: alpha(theme.palette.secondary.light, 0.04),
    },
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  titleText: {
    fontWeight: 600,
    color: theme.palette.secondary.light,
  },
  progressText: {
    color: allDone
      ? theme.palette.success.light
      : alpha(theme.palette.text.secondary, 0.6),
    fontWeight: 500,
  },
  chevron: {
    display: "flex",
    color: theme.palette.text.secondary,
  },
  content: {
    borderTop: `1px solid ${alpha(theme.palette.secondary.light, 0.1)}`,
    px: 0.5,
    py: 0.5,
  },
});
