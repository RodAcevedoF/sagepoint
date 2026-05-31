import { describe, it, expect } from "vitest";
import {
  formatSlug,
  categoryFeedTone,
} from "@/features/dashboard/components/DashboardNews/news.utils";

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

describe("categoryFeedTone", () => {
  it("returns mapped tone for known slug", () => {
    expect(categoryFeedTone("web-development")).toBe("teal");
    expect(categoryFeedTone("devops")).toBe("proc");
    expect(categoryFeedTone("databases")).toBe("concept");
  });

  it("falls back to 'teal' for unknown slug", () => {
    expect(categoryFeedTone("unknown-category")).toBe("teal");
  });
});
