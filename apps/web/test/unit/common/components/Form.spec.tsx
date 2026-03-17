import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormContext } from "@/common/components/Form/FormContext";
import { FormHeader } from "@/common/components/Form/FormHeader";
import { FormError } from "@/common/components/Form/FormError";
import { FormField } from "@/common/components/Form/FormField";
import { FormDivider } from "@/common/components/Form/FormDivider";

function renderWithFormContext(ui: React.ReactElement, error?: string) {
  return render(
    <FormContext.Provider value={{ error }}>{ui}</FormContext.Provider>,
  );
}

describe("FormHeader", () => {
  it("renders title as heading", () => {
    render(<FormHeader title="Sign In" />);
    expect(
      screen.getByRole("heading", { name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<FormHeader title="Sign In" subtitle="Welcome back" />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    render(<FormHeader title="Sign In" />);
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });
});

describe("FormError", () => {
  it("shows error message from context", () => {
    renderWithFormContext(<FormError />, "Invalid credentials");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("renders nothing when no error", () => {
    renderWithFormContext(<FormError />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when error is undefined", () => {
    renderWithFormContext(<FormError />, undefined);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("renders a text input with label", () => {
    render(<FormField name="email" label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders as required field", () => {
    render(<FormField name="email" label="Email" required />);
    // MUI adds asterisk to required labels
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("renders with password type", () => {
    render(<FormField name="password" label="Password" type="password" />);
    // Password fields don't have textbox role
    const input = document.querySelector('input[name="password"]');
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders with default value", () => {
    render(<FormField name="name" label="Name" defaultValue="John" />);
    expect(screen.getByRole("textbox")).toHaveValue("John");
  });

  it("renders with placeholder", () => {
    render(
      <FormField name="email" label="Email" placeholder="you@example.com" />,
    );
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders as multiline (textarea)", () => {
    render(<FormField name="bio" label="Bio" multiline rows={4} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

describe("FormDivider", () => {
  it('renders default "or" text', () => {
    render(<FormDivider />);
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("renders custom children", () => {
    render(<FormDivider>or continue with</FormDivider>);
    expect(screen.getByText("or continue with")).toBeInTheDocument();
  });
});
