import { aurora, auroraTint } from "@/shared/theme";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isExpired(expiresAt: string, status: string): boolean {
  return status === "PENDING" && new Date(expiresAt) < new Date();
}

export function buildInviteLink(token: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/register?invitation=${token}`;
}

export const statusColors: Record<string, string> = {
  PENDING: aurora.status.proc,
  PROCESSING: aurora.status.concept,
  COMPLETED: aurora.status.ready,
  FAILED: aurora.status.fail,
};

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

export const invitationStatusColors: Record<
  string,
  { bg: string; text: string }
> = {
  PENDING: {
    bg: auroraTint(aurora.status.proc, 0.12),
    text: aurora.status.proc,
  },
  ACCEPTED: {
    bg: auroraTint(aurora.status.ready, 0.12),
    text: aurora.status.ready,
  },
  REVOKED: {
    bg: auroraTint(aurora.status.fail, 0.12),
    text: aurora.status.fail,
  },
};
