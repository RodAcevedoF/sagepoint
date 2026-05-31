import { aurora, auroraTint } from "@/shared/theme";

export const inviteLinkBoxSx = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: aurora.radii.md,
  background: auroraTint(aurora.status.ready, 0.08),
  border: `1px solid ${auroraTint(aurora.status.ready, 0.28)}`,
  display: "flex",
  alignItems: "center",
  gap: "12px",
} as const;

export const inviteLinkTextSx = {
  flex: 1,
  minWidth: 0,
  wordBreak: "break-all" as const,
  color: aurora.status.ready,
  fontFamily: aurora.font.mono,
  fontSize: "12.5px",
} as const;

export const copyButtonSx = {
  width: 32,
  height: 32,
  borderRadius: aurora.radii.sm,
  color: aurora.status.ready,
  border: `1px solid ${auroraTint(aurora.status.ready, 0.3)}`,
  background: auroraTint(aurora.status.ready, 0.1),
  "&:hover": { background: auroraTint(aurora.status.ready, 0.18) },
} as const;

export const menuPaperSx = {
  background: aurora.surface,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.md,
  boxShadow: aurora.shadow.card,
  marginTop: "6px",
  fontFamily: aurora.font.ui,
  minWidth: "200px",
  "& .MuiMenuItem-root": {
    fontFamily: aurora.font.ui,
    fontSize: "14px",
    color: aurora.status.fail,
    paddingY: "10px",
    "&:hover": {
      background: auroraTint(aurora.status.fail, 0.1),
      color: aurora.status.fail,
    },
  },
  "& .MuiListItemIcon-root": { minWidth: "30px" },
} as const;

export const formCardSx = {
  marginBottom: "18px",
  padding: { xs: "22px", md: "28px 30px" },
} as const;

export const formHeadingSx = {
  fontFamily: aurora.font.display,
  fontWeight: 700,
  fontSize: "20px",
  color: aurora.txHi,
  letterSpacing: "-0.015em",
  margin: 0,
} as const;

export const formSubheadingSx = {
  fontSize: "13.5px",
  color: aurora.txMid,
  marginTop: "5px",
} as const;

export const snackbarAlertSx = {
  background: aurora.surface,
  color: aurora.txHi,
  border: `1px solid ${aurora.line2}`,
  borderRadius: aurora.radii.md,
  fontFamily: aurora.font.ui,
  fontWeight: 600,
  "&.MuiAlert-filledSuccess": {
    border: `1px solid ${auroraTint(aurora.status.ready, 0.35)}`,
    background: auroraTint(aurora.status.ready, 0.18),
    color: aurora.status.ready,
  },
  "&.MuiAlert-filledError": {
    border: `1px solid ${auroraTint(aurora.status.fail, 0.35)}`,
    background: auroraTint(aurora.status.fail, 0.18),
    color: aurora.status.fail,
  },
  "& .MuiAlert-icon": { color: "inherit" },
} as const;
