import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/shared/components/ui/Button/Button";
import {
  ButtonVariants,
  ButtonTypes,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { Plus } from "lucide-react";

describe("Button", () => {
  it("renders label text", () => {
    render(<Button label="Save" />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button label="Click me" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button label="Disabled" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<Button label="Loading" loading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    render(<Button label="Saving..." loading />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders with submit type", () => {
    render(<Button label="Submit" type={ButtonTypes.SUBMIT} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("applies data-testid", () => {
    render(<Button label="Test" testId="my-btn" />);
    expect(screen.getByTestId("my-btn")).toBeInTheDocument();
  });

  it("renders icon at start position", () => {
    render(
      <Button label="Add" icon={Plus} iconPos={ButtonIconPositions.START} />,
    );
    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeInTheDocument();
  });

  it("renders without label (icon-only)", () => {
    render(<Button icon={Plus} testId="icon-btn" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("accepts all variant values without error", () => {
    const variants = [
      ButtonVariants.DEFAULT,
      ButtonVariants.SECONDARY,
      ButtonVariants.OUTLINED,
      ButtonVariants.GHOST,
      ButtonVariants.GLASS,
      ButtonVariants.DANGER,
    ];
    for (const variant of variants) {
      const { unmount } = render(<Button label={variant} variant={variant} />);
      expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
      unmount();
    }
  });

  it("accepts all size values without error", () => {
    const sizes = [ButtonSizes.SMALL, ButtonSizes.MEDIUM, ButtonSizes.LARGE];
    for (const size of sizes) {
      const { unmount } = render(<Button label={size} size={size} />);
      expect(screen.getByRole("button", { name: size })).toBeInTheDocument();
      unmount();
    }
  });
});
