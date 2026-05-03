import { type Theme } from "@mui/material";

export const makeStyles = (theme: Theme) => ({
  container: {
    py: 1,
  },
  textField: {
    mb: 2,
  },
  nameField: {
    mb: 3,
  },
  errorText: {
    color: theme.palette.error.light,
    mb: 2,
  },
});
