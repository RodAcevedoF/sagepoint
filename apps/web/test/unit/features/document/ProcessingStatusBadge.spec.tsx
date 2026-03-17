import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProcessingStatusBadge } from "@/features/document/components/ProcessingStatusBadge";
import { ProcessingStage } from "@sagepoint/domain";

describe("ProcessingStatusBadge", () => {
  it.each([
    [ProcessingStage.UPLOADED, "Uploaded"],
    [ProcessingStage.PARSING, "Parsing"],
    [ProcessingStage.ANALYZING, "Analyzing"],
    [ProcessingStage.SUMMARIZED, "Summarized"],
    [ProcessingStage.READY, "Ready"],
  ] as const)('renders "%s" stage as "%s"', (stage, expectedLabel) => {
    render(<ProcessingStatusBadge stage={stage} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
