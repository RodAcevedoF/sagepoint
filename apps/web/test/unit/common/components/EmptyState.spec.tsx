import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "@/common/components/States/EmptyState";

describe("EmptyState", () => {
  it("renders default title when no props given", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <EmptyState
        title="No documents"
        description="Upload your first document to get started"
      />,
    );
    expect(screen.getByText("No documents")).toBeInTheDocument();
    expect(
      screen.getByText("Upload your first document to get started"),
    ).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });

  it("renders action button and calls handler on click", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<EmptyState actionLabel="Create new" onAction={onAction} />);

    const button = screen.getByRole("button", { name: /create new/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("does not render action button when only label is given without handler", () => {
    render(<EmptyState actionLabel="Create new" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
