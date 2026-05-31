import { aurora, auroraTint } from "@/shared/theme";
import { CELL_SIZE, DAY_LABEL_W, GAP, MONTH_ROW_H } from "./constants";

/**
 * Cells are fixed-width on mobile (overflow + scroll) and fluid on desktop
 * (fill the panel width). The `--cell-h` CSS variable, computed from the
 * container's inline size (`cqi`), keeps the day-labels column heights in
 * lockstep with the cells across both modes.
 */
export const heatmapRow = (cols: number) => ({
  containerType: "inline-size" as const,
  "--cell-h": `${CELL_SIZE}px`,
  "@media (min-width: 900px)": {
    "--cell-h": `calc((100cqi - ${DAY_LABEL_W}px - ${cols * GAP}px) / ${cols})`,
  },
  display: "flex",
  alignItems: "stretch",
  gap: `${GAP}px`,
});

export const styles = {
  card: {
    p: { xs: "22px 18px", md: "28px 30px 26px" },
  },
  loading: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 13, color: aurora.txMid },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: { xs: 2.5, md: 3 },
    flexWrap: "wrap" as const,
    gap: 2,
  },
  title: {
    fontFamily: aurora.font.display,
    fontWeight: 700,
    fontSize: { xs: 18, md: 22 },
    color: aurora.txHi,
    lineHeight: 1.2,
    letterSpacing: "-0.015em",
    m: 0,
  },
  subtitle: {
    fontSize: 13.5,
    color: aurora.teal,
    fontFamily: aurora.font.mono,
    mt: 0.5,
  },
  dayLabelsCol: {
    flex: "none",
    width: DAY_LABEL_W,
    display: "flex",
    flexDirection: "column" as const,
    gap: `${GAP}px`,
    pt: `${MONTH_ROW_H + GAP}px`,
  },
  dayLabelCell: {
    height: "var(--cell-h)",
    display: "flex",
    alignItems: "center",
    fontFamily: aurora.font.mono,
    fontSize: 10,
    color: aurora.txLow,
    userSelect: "none" as const,
    whiteSpace: "nowrap" as const,
    lineHeight: 1,
  },
  scrollWrap: {
    flex: 1,
    minWidth: 0,
    overflowX: { xs: "auto" as const, md: "visible" as const },
    overflowY: "hidden" as const,
    "&::-webkit-scrollbar": { height: 6 },
    "&::-webkit-scrollbar-thumb": {
      bgcolor: auroraTint(aurora.txLow, 0.3),
      borderRadius: 3,
    },
  },
  scrollInner: {
    display: "flex",
    flexDirection: "column" as const,
    gap: `${GAP}px`,
    width: { xs: "max-content", md: "100%" },
  },
  monthsRow: (cols: number) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, var(--cell-h))`,
    columnGap: `${GAP}px`,
    height: MONTH_ROW_H,
  }),
  monthLabel: {
    fontFamily: aurora.font.mono,
    fontSize: 11,
    color: aurora.txLow,
    lineHeight: `${MONTH_ROW_H}px`,
    whiteSpace: "nowrap" as const,
    userSelect: "none" as const,
  },
  cellsGrid: (cols: number) => ({
    display: "grid",
    gridAutoFlow: "column" as const,
    gridTemplateRows: "repeat(7, var(--cell-h))",
    gridTemplateColumns: `repeat(${cols}, var(--cell-h))`,
    columnGap: `${GAP}px`,
    rowGap: `${GAP}px`,
  }),
  cellBase: {
    width: "var(--cell-h)",
    height: "var(--cell-h)",
    borderRadius: "3px",
    border: "1px solid oklch(1 0 0 / 0.03)",
  },
  statBlock: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 15px",
    borderRadius: aurora.radii.md,
    border: `1px solid ${aurora.line}`,
    background: "oklch(0.255 0.024 262 / 0.5)",
  },
  statIconWrap: (color: string) => ({
    width: 34,
    height: 34,
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `color-mix(in oklch, ${color} 15%, ${aurora.surface2})`,
    border: `1px solid ${auroraTint(color, 0.26)}`,
    color,
    flexShrink: 0,
  }),
  statValue: {
    fontFamily: aurora.font.display,
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1,
    color: aurora.txHi,
  },
  statLabel: {
    fontFamily: aurora.font.mono,
    fontSize: 9.5,
    color: aurora.txLow,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontWeight: 600,
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
    gap: 0.9,
    fontFamily: aurora.font.mono,
    fontSize: 11,
    color: aurora.txLow,
  },
  legendSwatch: {
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    borderRadius: "3px",
  },
  caption: {
    fontSize: 13.5,
    color: aurora.txMid,
    fontStyle: "italic" as const,
  },
};
