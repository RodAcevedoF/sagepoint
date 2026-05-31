import { aurora, auroraTint } from "@/shared/theme";

export const adminTableStyles = {
  panelHead: {
    display: "flex",
    alignItems: { xs: "flex-start", md: "center" },
    justifyContent: "space-between",
    gap: "16px",
    padding: { xs: "20px 22px 16px", md: "26px 30px 22px" },
    flexWrap: "wrap" as const,
  },
  panelTitle: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    flexWrap: "wrap" as const,
  },
  panelTitleIcon: {
    width: 40,
    height: 40,
    borderRadius: "11px",
    display: "grid",
    placeItems: "center",
    background: auroraTint(aurora.teal, 0.13),
    border: `1px solid ${auroraTint(aurora.teal, 0.28)}`,
    color: aurora.teal,
    flex: "none",
  },
  panelHeading: {
    fontFamily: aurora.font.display,
    fontWeight: 700,
    fontSize: "22px",
    color: aurora.txHi,
    margin: 0,
    letterSpacing: "-0.015em",
  },
  tableScroll: {
    overflowX: "auto",
    "&::-webkit-scrollbar": { height: "8px" },
    "&::-webkit-scrollbar-thumb": {
      background: aurora.line2,
      borderRadius: "8px",
    },
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "860px",
  },
  headerCell: {
    textAlign: "left",
    fontFamily: aurora.font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: aurora.teal,
    padding: "12px 20px",
    borderBottom: `1px solid ${aurora.line}`,
    whiteSpace: "nowrap",
    background: "transparent",
  },
  bodyCell: {
    padding: "18px 20px",
    borderBottom: `1px solid ${aurora.line}`,
    verticalAlign: "middle",
    color: aurora.tx,
    fontSize: "14px",
  },
  row: {
    transition: "background-color .15s ease",
    "&:hover": {
      background: "oklch(0.27 0.022 262 / 0.4)",
    },
    "&:last-of-type td": {
      borderBottom: "none",
    },
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    padding: { xs: "0 22px 16px", md: "0 30px 18px" },
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
} as const;

export const filterSelectSx = {
  minWidth: 160,
  "& .MuiOutlinedInput-root": {
    fontFamily: aurora.font.ui,
    color: aurora.txHi,
    background: "oklch(0.21 0.025 262 / 0.7)",
    borderRadius: aurora.radii.md,
    "& fieldset": { borderColor: aurora.line },
    "&:hover fieldset": { borderColor: aurora.line2 },
    "&.Mui-focused fieldset": {
      borderColor: aurora.teal,
      boxShadow: `0 0 0 3px ${auroraTint(aurora.teal, 0.22)}`,
    },
  },
  "& .MuiInputLabel-root": {
    color: aurora.txMid,
    "&.Mui-focused": { color: aurora.teal },
  },
  "& .MuiSelect-icon": { color: aurora.txMid },
} as const;

export const filterMenuPaperSx = {
  background: aurora.surface,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.md,
  fontFamily: aurora.font.ui,
  color: aurora.tx,
  "& .MuiMenuItem-root": {
    fontFamily: aurora.font.ui,
    fontSize: "14px",
    color: aurora.tx,
    "&:hover": {
      background: auroraTint(aurora.teal, 0.08),
      color: aurora.txHi,
    },
    "&.Mui-selected": {
      background: auroraTint(aurora.teal, 0.14),
      color: aurora.txHi,
      "&:hover": { background: auroraTint(aurora.teal, 0.2) },
    },
  },
} as const;

export const paginationSx = {
  color: aurora.txMid,
  fontFamily: aurora.font.ui,
  borderTop: `1px solid ${aurora.line}`,
  "& .MuiTablePagination-toolbar": {
    paddingX: { xs: "16px", md: "24px" },
  },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    color: aurora.txMid,
    fontSize: "13px",
  },
  "& .MuiTablePagination-select": {
    color: aurora.txHi,
    fontFamily: aurora.font.mono,
  },
  "& .MuiSelect-icon": { color: aurora.txMid },
  "& .MuiIconButton-root": {
    color: aurora.txMid,
    "&:hover": {
      background: auroraTint(aurora.teal, 0.08),
      color: aurora.txHi,
    },
    "&.Mui-disabled": { color: aurora.txLow },
  },
} as const;

export const iconActionSx = {
  width: 34,
  height: 34,
  borderRadius: aurora.radii.md,
  color: aurora.txMid,
  border: `1px solid ${aurora.line}`,
  background: aurora.surface2,
  "&:hover": {
    background: aurora.surface3,
    color: aurora.txHi,
    borderColor: aurora.line2,
  },
} as const;

export const filterButtonSx = {
  fontFamily: aurora.font.ui,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: aurora.radii.md,
  background: auroraTint(aurora.status.fail, 0.1),
  border: `1px solid ${auroraTint(aurora.status.fail, 0.3)}`,
  color: aurora.status.fail,
  "&:hover": {
    background: auroraTint(aurora.status.fail, 0.16),
    border: `1px solid ${auroraTint(aurora.status.fail, 0.4)}`,
  },
} as const;
