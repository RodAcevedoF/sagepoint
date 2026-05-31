import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";

export const styles = {
  card: {
    p: 2.5,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
  },
  title: {
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  titleIcon: {
    p: 0.8,
    borderRadius: 1.5,
    bgcolor: alpha(palette.info.main, 0.1),
    display: "flex",
    color: palette.info.main,
  },
  feedLink: {
    color: palette.info.light,
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    cursor: "pointer",
    fontWeight: 500,
    "&:hover": { color: palette.info.main },
  },
};
