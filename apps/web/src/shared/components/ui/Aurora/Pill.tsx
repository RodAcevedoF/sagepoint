import type { CSSProperties, ReactNode } from "react";
import { auroraTint } from "@/shared/theme";
import { resolveAccent, type AuroraTone } from "./tones";

interface PillProps {
  children: ReactNode;
  icon?: ReactNode;
  tone?: AuroraTone;
  accent?: string;
  style?: CSSProperties;
}

/**
 * Aurora inline pill (small tinted chip with an optional leading icon).
 * Tone drives both the tint and the text color — generic enough for cadence
 * pills, tag pills, badge pills, etc.
 */
export function Pill({
  children,
  icon,
  tone = "concept",
  accent,
  style,
}: PillProps) {
  const color = resolveAccent(tone, accent);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 11px",
        borderRadius: 999,
        background: auroraTint(color, 0.12),
        border: `1px solid ${auroraTint(color, 0.28)}`,
        color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
