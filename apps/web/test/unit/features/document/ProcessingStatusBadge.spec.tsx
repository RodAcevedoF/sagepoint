import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProcessingStatusBadge } from "@/features/document/components/ProcessingStatusBadge";
import { ProcessingStage } from "@sagepoint/domain";

describe("ProcessingStatusBadge", () => {
  it.each([
    [ProcessingStage.UPLOADED, "Inferring"],
    [ProcessingStage.PARSING, "Processing"],
    [ProcessingStage.ANALYZING, "Processing"],
    [ProcessingStage.SUMMARIZED, "Processing"],
    [ProcessingStage.ENRICHING, "Enriching"],
    [ProcessingStage.READY, "Ready"],
  ] as const)('renders "%s" stage as "%s"', (stage, expectedLabel) => {
    render(<ProcessingStatusBadge stage={stage} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
