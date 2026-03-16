import React from "react";
import { vi } from "vitest";

// ─── next/navigation ────────────────────────────────────────────────────────
const push = vi.fn();
const replace = vi.fn();
const back = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, back }),
  useSearchParams: () => searchParams,
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

export const mockRouter = { push, replace, back };
export const mockSearchParams = searchParams;
