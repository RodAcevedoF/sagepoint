import { alpha } from "@mui/material";
import { palette } from "@/shared/theme";
import {
  DAY_LABEL_W_MOBILE,
  DAY_LABEL_W_DESKTOP,
  MONTH_ROW_H,
  MOBILE_CELL_W,
  GAP,
} from "./constants";

export const styles = {
  card: {
    px: { xs: 2, md: 4 },
    py: { xs: 2.5, md: 3.5 },
    width: "100%",
    height: "100%",
  },
  loading: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 13, color: palette.text.secondary },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: { xs: 2.5, md: 3.5 },
    flexWrap: "wrap" as const,
    gap: 2,
  },
  title: { fontSize: { xs: 16, md: 18 }, fontWeight: 700, lineHeight: 1.2 },
  subtitle: { fontSize: 13, color: palette.text.secondary, mt: 0.5 },
  cellBase: {
    aspectRatio: "1 / 1",
    borderRadius: "3px",
    minWidth: 0,
  },
  monthLabelCell: {
    height: MONTH_ROW_H,
    position: "relative" as const,
    overflow: "visible" as const,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: palette.text.primary,
    height: MONTH_ROW_H,
    lineHeight: `${MONTH_ROW_H}px`,
    userSelect: "none" as const,
    whiteSpace: "nowrap" as const,
    letterSpacing: "0.02em",
  },
  dayLabelCell: {
    display: "flex",
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: palette.text.primary,
    userSelect: "none" as const,
  },
  statBlock: {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
  },
  statIconWrap: (color: string) => ({
    width: 36,
    height: 36,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: alpha(color, 0.15),
    color,
    flexShrink: 0,
  }),
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    color: palette.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: palette.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontWeight: 500,
    mt: 0.4,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mt: 2.5,
    flexWrap: "wrap" as const,
    gap: 1.5,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
  },
  legendLabel: { fontSize: 11, color: palette.text.secondary },
  legendSwatch: { width: 12, height: 12, borderRadius: "3px" },
  caption: {
    fontSize: 12,
    color: palette.text.secondary,
    fontStyle: "italic" as const,
  },
  scrollContainer: {
    overflowX: { xs: "auto" as const, md: "visible" as const },
    overflowY: "hidden" as const,
    mx: { xs: -2, md: 0 },
    px: { xs: 2, md: 0 },
    "&::-webkit-scrollbar": { height: 6 },
    "&::-webkit-scrollbar-thumb": {
      bgcolor: alpha(palette.text.secondary, 0.25),
      borderRadius: 3,
    },
  },
  stickyLabel: {
    position: { xs: "sticky" as const, md: "static" as const },
    left: 0,
    zIndex: 1,
    bgcolor: palette.background.paper,
    pr: { xs: 0.25, md: 1 },
  },
};

export const buildGridSx = (cols: number) => ({
  display: "grid",
  gridTemplateColumns: {
    xs: `${DAY_LABEL_W_MOBILE}px repeat(${cols}, ${MOBILE_CELL_W}px)`,
    md: `${DAY_LABEL_W_DESKTOP}px repeat(${cols}, minmax(0, 1fr))`,
  },
  gridTemplateRows: {
    xs: `${MONTH_ROW_H}px repeat(7, ${MOBILE_CELL_W}px)`,
    md: `${MONTH_ROW_H}px repeat(7, 1fr)`,
  },
  columnGap: `${GAP}px`,
  rowGap: `${GAP}px`,
  width: { xs: "max-content", md: "100%" },
});
