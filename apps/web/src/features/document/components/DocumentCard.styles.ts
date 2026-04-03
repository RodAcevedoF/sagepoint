import { type Theme, type SxProps, alpha } from "@mui/material";

export const makeStyles = (
  stageColor: string,
  theme: Theme,
): Record<string, SxProps<Theme>> => ({
  card: {
    cursor: "pointer",
    height: "100%",
    borderLeft: `3px solid ${stageColor}`,
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 6px 20px ${alpha(stageColor, 0.18)}`,
    },
    "&:hover .delete-btn": {
      opacity: 1,
    },
    "&:hover .arrow-icon": {
      transform: "translateX(4px)",
      color: stageColor,
    },
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    mb: 1.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: alpha(stageColor, 0.1),
    color: stageColor,
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: 1.3,
    mb: 0.5,
  },
  deleteButton: {
    flexShrink: 0,
    p: 0.5,
    color: theme.palette.text.secondary,
    opacity: 0.25,
    transition:
      "opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease",
    "&:hover": {
      color: theme.palette.error.main,
      opacity: 1,
      bgcolor: alpha(theme.palette.error.main, 0.08),
    },
  },
  statsRow: {
    display: "flex",
    gap: 2,
    mt: 1,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
  statText: {
    color: theme.palette.text.disabled,
    fontSize: "0.82rem",
  },
  footer: {
    pt: 1,
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: theme.palette.text.disabled,
    fontSize: "0.82rem",
  },
  arrowIcon: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.disabled,
    transition: "transform 0.2s ease, color 0.2s ease",
  },
});
