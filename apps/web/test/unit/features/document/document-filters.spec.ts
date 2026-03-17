import { describe, it, expect } from "vitest";
import {
  isDocumentProcessing,
  filterAndPartitionDocuments,
} from "@/features/document/utils/document-filters";

describe("isDocumentProcessing", () => {
  it.each(["PENDING", "PARSING", "ANALYZING", "SUMMARIZING"])(
    "returns true for processing status: %s",
    (status) => {
      expect(isDocumentProcessing(status)).toBe(true);
    },
  );

  it.each(["COMPLETED", "FAILED"])(
    "returns false for terminal status: %s",
    (status) => {
      expect(isDocumentProcessing(status)).toBe(false);
    },
  );
});

describe("filterAndPartitionDocuments", () => {
  const docs = [
    { filename: "react-guide.pdf", status: "COMPLETED" },
    { filename: "node-tutorial.pdf", status: "PARSING" },
    { filename: "docker-intro.docx", status: "COMPLETED" },
    { filename: "ml-basics.pdf", status: "FAILED" },
  ];

  it("returns all documents when no filters applied", () => {
    const { processingDocs, completedDocs } = filterAndPartitionDocuments(
      docs,
      "",
      "all",
    );
    expect(processingDocs).toHaveLength(1);
    expect(completedDocs).toHaveLength(3);
  });

  it("filters by search query (case-insensitive)", () => {
    const { processingDocs, completedDocs } = filterAndPartitionDocuments(
      docs,
      "react",
      "all",
    );
    expect(completedDocs).toHaveLength(1);
    expect(completedDocs[0].filename).toBe("react-guide.pdf");
    expect(processingDocs).toHaveLength(0);
  });

  it("filters processing documents only", () => {
    const { processingDocs, completedDocs } = filterAndPartitionDocuments(
      docs,
      "",
      "processing",
    );
    expect(processingDocs).toHaveLength(1);
    expect(processingDocs[0].filename).toBe("node-tutorial.pdf");
    expect(completedDocs).toHaveLength(0);
  });

  it("filters ready documents only", () => {
    const { processingDocs, completedDocs } = filterAndPartitionDocuments(
      docs,
      "",
      "ready",
    );
    expect(completedDocs).toHaveLength(3);
    expect(processingDocs).toHaveLength(0);
  });

  it("combines search query with stage filter", () => {
    const { completedDocs } = filterAndPartitionDocuments(
      docs,
      "docker",
      "ready",
    );
    expect(completedDocs).toHaveLength(1);
    expect(completedDocs[0].filename).toBe("docker-intro.docx");
  });

  it("returns empty partitions for empty input", () => {
    const { processingDocs, completedDocs } = filterAndPartitionDocuments(
      [],
      "",
      "all",
    );
    expect(processingDocs).toEqual([]);
    expect(completedDocs).toEqual([]);
  });
});
