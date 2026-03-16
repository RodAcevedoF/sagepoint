import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ErrorState } from "@/common/components/States/ErrorState";

describe("ErrorState", () => {
  it("renders default title and description", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <ErrorState title="Network error" description="Check your connection" />,
    );
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.getByText("Check your connection")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState onRetry={onRetry} />);

    const button = screen.getByRole("button", { name: /try again/i });
    await user.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders custom retry label", () => {
    render(<ErrorState onRetry={() => {}} retryLabel="Reload" />);
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
