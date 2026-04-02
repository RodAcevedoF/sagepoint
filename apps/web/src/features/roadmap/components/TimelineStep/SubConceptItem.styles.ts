import { alpha, type Theme } from "@mui/material/styles";
import { StepStatus } from "@sagepoint/domain";

export const makeStyles = (theme: Theme, status: StepStatus) => {
  const isCompleted = status === StepStatus.COMPLETED;

  return {
    container: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      py: 1,
      px: 1.5,
      borderRadius: 2,
      cursor: "pointer",
      userSelect: "none",
      transition: "background-color 0.15s",
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.light, 0.06),
      },
    },
    label: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "0.75rem",
      color: alpha(theme.palette.text.secondary, 0.6),
      flexShrink: 0,
    },
    name: {
      flex: 1,
      fontWeight: 500,
      color: isCompleted
        ? alpha(theme.palette.text.primary, 0.6)
        : theme.palette.text.primary,
      textDecoration: isCompleted ? "line-through" : "none",
    },
    difficultyChip: {
      height: 20,
      fontSize: "0.7rem",
      bgcolor: alpha(theme.palette.text.secondary, 0.08),
      color: theme.palette.text.secondary,
    },
    durationContainer: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      flexShrink: 0,
    },
    durationText: {
      color: theme.palette.text.secondary,
      fontSize: "0.7rem",
    },
  };
};

export function getStatusColor(theme: Theme, status: StepStatus): string {
  switch (status) {
    case StepStatus.COMPLETED:
      return theme.palette.success.light;
    case StepStatus.IN_PROGRESS:
      return theme.palette.warning.light;
    case StepStatus.SKIPPED:
      return alpha(theme.palette.text.secondary, 0.5);
    default:
      return theme.palette.text.secondary;
  }
}
