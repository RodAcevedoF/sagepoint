import { DocumentSummary } from "../../../../src";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

describe("DocumentSummary", () => {
  describe("constructor", () => {
    it("stores all required fields", () => {
      const summary = new DocumentSummary(
        "s1",
        "d1",
        "Overview text",
        ["Point A", "Point B"],
        "TypeScript",
        "intermediate",
        12,
        FIXED_DATE,
      );

      expect(summary.id).toBe("s1");
      expect(summary.documentId).toBe("d1");
      expect(summary.overview).toBe("Overview text");
      expect(summary.keyPoints).toEqual(["Point A", "Point B"]);
      expect(summary.topicArea).toBe("TypeScript");
      expect(summary.difficulty).toBe("intermediate");
      expect(summary.conceptCount).toBe(12);
      expect(summary.createdAt).toBe(FIXED_DATE);
      expect(summary.estimatedReadTime).toBeUndefined();
    });

    it("stores optional estimatedReadTime when provided", () => {
      const summary = new DocumentSummary(
        "s2",
        "d2",
        "Overview",
        [],
        "JS",
        "beginner",
        5,
        FIXED_DATE,
        15,
      );

      expect(summary.estimatedReadTime).toBe(15);
    });
  });
});
