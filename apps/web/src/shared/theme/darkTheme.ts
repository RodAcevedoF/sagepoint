import { createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    accent: string;
    purple: {
      main: string;
      light: string;
      dark: string;
    };
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
      expert: string;
      unknown: string;
    };
    experience: {
      beginner: string;
      intermediate: string;
      advanced: string;
      expert: string;
    };
    aurora: AuroraPalette;
  }
  interface PaletteOptions {
    accent?: string;
    purple?: {
      main?: string;
      light?: string;
      dark?: string;
    };
    difficulty?: {
      beginner?: string;
      intermediate?: string;
      advanced?: string;
      expert?: string;
      unknown?: string;
    };
    experience?: {
      beginner?: string;
      intermediate?: string;
      advanced?: string;
      expert?: string;
    };
    aurora?: AuroraPalette;
  }
}

export interface AuroraPalette {
  bg0: string;
  bg1: string;
  surface: string;
  surface2: string;
  surface3: string;
  line: string;
  line2: string;
  txHi: string;
  tx: string;
  txMid: string;
  txLow: string;
  teal: string;
  tealDeep: string;
  tealInk: string;
  status: {
    ready: string;
    proc: string;
    enrich: string;
    concept: string;
    fail: string;
  };
  difficulty: {
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  radii: {
    card: string;
    md: string;
    sm: string;
    pill: string;
  };
  shadow: {
    card: string;
    pop: string;
  };
  font: {
    display: string;
    ui: string;
    mono: string;
  };
}

export const aurora: AuroraPalette = {
  bg0: "oklch(0.145 0.028 264)",
  bg1: "oklch(0.185 0.030 262)",
  surface: "oklch(0.215 0.026 262)",
  surface2: "oklch(0.255 0.024 262)",
  surface3: "oklch(0.300 0.022 262)",
  line: "oklch(1 0 0 / 0.075)",
  line2: "oklch(1 0 0 / 0.13)",
  txHi: "oklch(0.965 0.008 250)",
  tx: "oklch(0.80 0.018 252)",
  txMid: "oklch(0.655 0.020 256)",
  txLow: "oklch(0.520 0.022 258)",
  teal: "oklch(0.825 0.118 178)",
  tealDeep: "oklch(0.70 0.105 180)",
  tealInk: "oklch(0.26 0.05 195)",
  status: {
    ready: "oklch(0.80 0.135 168)",
    proc: "oklch(0.82 0.135 78)",
    enrich: "oklch(0.80 0.13 300)",
    concept: "oklch(0.78 0.115 248)",
    fail: "oklch(0.74 0.145 18)",
  },
  difficulty: {
    beginner: "oklch(0.80 0.135 162)",
    intermediate: "oklch(0.83 0.135 88)",
    advanced: "oklch(0.76 0.145 38)",
    expert: "oklch(0.74 0.14 12)",
  },
  radii: {
    card: "22px",
    md: "13px",
    sm: "9px",
    pill: "999px",
  },
  shadow: {
    card: "0 1px 0 0 oklch(1 0 0 / 0.04) inset, 0 18px 40px -24px oklch(0.05 0.04 264 / 0.9)",
    pop: "0 30px 70px -30px oklch(0.04 0.05 264 / 0.95)",
  },
  font: {
    display: '"Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif',
    ui: '"Hanken Grotesk", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
};

/**
 * Tint an Aurora color with alpha using CSS color-mix.
 * MUI's `alpha()` does not understand oklch() — use this instead.
 */
export function auroraTint(color: string, opacity: number): string {
  const pct = Math.max(0, Math.min(100, Math.round(opacity * 100)));
  return `color-mix(in oklch, ${color} ${pct}%, transparent)`;
}

export const palette = {
  primary: {
    main: "#35A29F",
    light: "#97FEED",
    dark: "#0B666A",
  },
  secondary: {
    main: "#0B666A",
    light: "#35A29F",
    dark: "#071952",
  },
  background: {
    default: "#030712",
    paper: "#0a0f1a",
    gradient:
      "radial-gradient(circle at 50% 50%, #0a0a0a 0%, #030712 60%, #071952 100%)",
  },
  text: {
    primary: "#f5f5f5",
    secondary: "rgba(151, 254, 237, 0.7)",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
  },
  success: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
  },
  info: {
    main: "#3b82f6",
    light: "#60a5fa",
    dark: "#2563eb",
  },
  difficulty: {
    beginner: "#10b981",
    intermediate: "#3b82f6",
    advanced: "#f59e0b",
    expert: "#ef4444",
    unknown: "#94a3b8",
  },
  experience: {
    beginner: "#4ade80",
    intermediate: "#f59e0b",
    advanced: "#3b82f6",
    expert: "#a855f7",
  },
  purple: {
    main: "#a855f7",
    light: "#c084fc",
    dark: "#9333ea",
  },
  accent: "#97FEED",
  divider: "rgba(151, 254, 237, 0.08)",
  common: {
    white: "#ffffff",
    black: "#000000",
  },
  aurora,
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: palette.primary,
    secondary: palette.secondary,
    background: {
      default: palette.background.default,
      paper: palette.background.paper,
    },
    text: palette.text,
    divider: palette.divider,
    warning: palette.warning,
    error: palette.error,
    success: palette.success,
    info: palette.info,
    accent: palette.accent,
    purple: palette.purple,
    common: palette.common,
    difficulty: palette.difficulty,
    experience: palette.experience,
    aurora,
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
