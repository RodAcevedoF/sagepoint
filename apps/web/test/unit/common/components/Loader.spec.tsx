import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Loader } from "@/shared/components/ui/Loader/Loader";

describe("Loader", () => {
  describe("circular variant (default)", () => {
    it("renders spinner", () => {
      render(<Loader />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders message when provided", () => {
      render(<Loader message="Loading data..." />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("does not render message when not provided", () => {
      render(<Loader />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  describe("page variant", () => {
    it("renders without spinner (uses grid animation instead)", () => {
      render(<Loader variant="page" />);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("renders message when provided", () => {
      render(<Loader variant="page" message="Preparing your roadmap..." />);
      expect(screen.getByText("Preparing your roadmap...")).toBeInTheDocument();
    });

    it("does not render message when not provided", () => {
      render(<Loader variant="page" />);
      expect(screen.queryByText(/preparing/i)).not.toBeInTheDocument();
    });
  });
});
