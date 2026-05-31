import { aurora } from "@/shared/theme";

export type AuroraTone =
  | "teal"
  | "ready"
  | "proc"
  | "enrich"
  | "concept"
  | "fail";

export type AuroraDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

const TONE_TO_COLOR: Record<AuroraTone, string> = {
  teal: aurora.teal,
  ready: aurora.status.ready,
  proc: aurora.status.proc,
  enrich: aurora.status.enrich,
  concept: aurora.status.concept,
  fail: aurora.status.fail,
};

export function toneColor(tone: AuroraTone): string {
  return TONE_TO_COLOR[tone];
}

export function difficultyColor(d: AuroraDifficulty): string {
  return aurora.difficulty[d];
}

/**
 * Resolve an accent color from either an explicit color string or a tone token.
 * Explicit `accent` wins; otherwise the tone is mapped through the theme.
 */
export function resolveAccent(
  tone: AuroraTone | undefined,
  accent: string | undefined,
  fallback: AuroraTone = "teal",
): string {
  if (accent) return accent;
  return toneColor(tone ?? fallback);
}
