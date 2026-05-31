import { aurora, auroraTint } from "@/shared/theme";

export const HEADERS = [
  "Identity",
  "Auth Detail",
  "Permission",
  "Status",
  "Registration",
  "Actions",
] as const;

export const roleColors: Record<string, string> = {
  ADMIN: aurora.status.fail,
  USER: aurora.txMid,
};

export const activeColors: Record<string, string> = {
  Active: aurora.status.ready,
  Banned: aurora.status.fail,
};

const AVATAR_TONES = [
  aurora.status.concept,
  aurora.teal,
  aurora.status.ready,
  aurora.status.proc,
  aurora.status.enrich,
] as const;

export function avatarColorFor(role: string, seed: string): string {
  if (role === "ADMIN") return aurora.status.fail;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? aurora.teal;
}

export function getAvatarSx(color: string) {
  return {
    flex: "none",
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: "17px",
    background: auroraTint(color, 0.16),
    color,
    border: `1px solid ${auroraTint(color, 0.35)}`,
  } as const;
}
