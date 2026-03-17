import { describe, it, expect } from "vitest";
import {
  formatSlug,
  getCategoryColor,
} from "@/features/dashboard/components/DahsboardNews/news.utils";

describe("formatSlug", () => {
  it.each([
    ["web-development", "Web Development"],
    ["machine-learning", "Machine Learning"],
    ["devops", "Devops"],
    ["a", "A"],
  ])("formatSlug(%s) → %s", (input, expected) => {
    expect(formatSlug(input)).toBe(expected);
  });
});

describe("getCategoryColor", () => {
  it("returns mapped color for known slug", () => {
    const color = getCategoryColor("web-development");
    expect(color).toBeDefined();
    expect(typeof color).toBe("string");
  });

  it("returns fallback color for unknown slug", () => {
    const known = getCategoryColor("web-development");
    const unknown = getCategoryColor("unknown-category");
    // Both should be strings; unknown falls back to palette.info.main (same as web-development)
    expect(typeof unknown).toBe("string");
    expect(unknown).toBe(known);
  });
});
