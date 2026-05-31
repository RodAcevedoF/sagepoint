import { describe, it, expect } from "vitest";
import {
  mapToAuroraStatus,
  mapToPipelineStage,
} from "@/features/document/utils/documentStatusMap";

describe("mapToAuroraStatus", () => {
  it("returns failed when document status is FAILED", () => {
    expect(mapToAuroraStatus("FAILED", "READY")).toBe("failed");
    expect(mapToAuroraStatus("FAILED", "PARSING")).toBe("failed");
  });

  it("returns ready when stage is READY", () => {
    expect(mapToAuroraStatus("COMPLETED", "READY")).toBe("ready");
  });

  it("returns enriching when stage is ENRICHING", () => {
    expect(mapToAuroraStatus("PROCESSING", "ENRICHING")).toBe("enriching");
  });

  it.each(["PARSING", "ANALYZING", "SUMMARIZED"])(
    "returns processing for stage %s",
    (stage) => {
      expect(mapToAuroraStatus("PROCESSING", stage)).toBe("processing");
    },
  );

  it("returns inferring when stage is UPLOADED or missing", () => {
    expect(mapToAuroraStatus("PROCESSING", "UPLOADED")).toBe("inferring");
    expect(mapToAuroraStatus("PROCESSING", null)).toBe("inferring");
    expect(mapToAuroraStatus("PENDING")).toBe("inferring");
  });
});

describe("mapToPipelineStage", () => {
  it("maps READY/ENRICHING to 3", () => {
    expect(mapToPipelineStage("READY")).toBe(3);
    expect(mapToPipelineStage("ENRICHING")).toBe(3);
  });

  it("maps ANALYZING/SUMMARIZED to 2", () => {
    expect(mapToPipelineStage("ANALYZING")).toBe(2);
    expect(mapToPipelineStage("SUMMARIZED")).toBe(2);
  });

  it("defaults early stages to 1", () => {
    expect(mapToPipelineStage("PARSING")).toBe(1);
    expect(mapToPipelineStage("UPLOADED")).toBe(1);
    expect(mapToPipelineStage(null)).toBe(1);
    expect(mapToPipelineStage(undefined)).toBe(1);
  });
});
