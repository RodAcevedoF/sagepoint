import { describe, it, expect } from "vitest";
import { readingTimeMinutes } from "@/features/blog/utils/readingTime";

describe("readingTimeMinutes", () => {
  it("returns at least 1 minute for very short content", () => {
    expect(readingTimeMinutes("Just a few words.")).toBe(1);
  });

  it("returns 1 minute for empty content", () => {
    expect(readingTimeMinutes("")).toBe(1);
    expect(readingTimeMinutes("   ")).toBe(1);
  });

  it("rounds 220 words to 1 minute", () => {
    const text = Array(220).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(1);
  });

  it("returns 2 minutes for ~440 words", () => {
    const text = Array(440).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(2);
  });

  it("ignores extra whitespace and newlines", () => {
    const text = "word\n\nword   word\tword";
    expect(readingTimeMinutes(text)).toBe(1);
  });

  it("scales for long content", () => {
    const text = Array(2200).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(10);
  });
});
