import { alpha, type Theme, type SxProps } from "@mui/material/styles";

export interface BlueprintGraphStyles {
  container: SxProps<Theme>;
}

export const makeStyles = (theme: Theme): BlueprintGraphStyles => ({
  container: {
    width: "100%",
    borderRadius: 5,
    border: `1px solid ${alpha(theme.palette.accent, 0.12)}`,
    background: "#0a1628",
    overflow: "hidden",

    "& .react-flow__background": {
      backgroundColor: "#0a1628",
    },

    "& .react-flow__minimap": {
      backgroundColor: alpha("#0a1628", 0.9),
      borderRadius: 0,
      border: `1px solid ${alpha(theme.palette.accent, 0.1)}`,
      margin: "16px",
    },

    "& .react-flow__controls": {
      borderRadius: 0,
      border: `1px solid ${alpha(theme.palette.accent, 0.1)}`,
      backgroundColor: alpha("#0a1628", 0.9),
      margin: "16px",
      "& button": {
        backgroundColor: alpha("#0a1628", 0.9),
        color: theme.palette.text.secondary,
        borderColor: alpha(theme.palette.accent, 0.1),
        "&:hover": {
          backgroundColor: alpha(theme.palette.accent, 0.08),
        },
      },
    },

    "& .react-flow__attribution": {
      display: "none",
    },
  },
});
