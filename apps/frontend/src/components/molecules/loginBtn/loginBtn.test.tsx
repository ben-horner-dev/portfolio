import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginButton } from "./loginBtn";

vi.mock("next/link", () => ({
  default: vi.fn(
    ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href} data-testid="link">
        {children}
      </a>
    ),
  ),
}));

vi.mock("@/components/atoms/button", () => ({
  Button: vi.fn(
    ({
      children,
      asChild,
      size,
      className,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
      size?: string;
      className?: string;
    }) => (
      <div
        data-testid="button"
        data-aschild={asChild}
        data-size={size}
        className={className}
      >
        {children}
      </div>
    ),
  ),
}));

describe("LoginButton", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the button with provided text", () => {
    render(<LoginButton text="Sign In" />);

    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders with correct link href", () => {
    render(<LoginButton text="Login" />);

    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("href", "/auth/login?returnTo=%2F%23explore");
  });

  it("renders with different text", () => {
    render(<LoginButton text="Get Started" />);

    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders Button with asChild prop", () => {
    render(<LoginButton text="Login" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-aschild", "true");
  });

  it("renders Button with lg size", () => {
    render(<LoginButton text="Login" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("renders Button with styling classes", () => {
    render(<LoginButton text="Login" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-ctp-blue/20");
    expect(button).toHaveClass("hover:bg-ctp-blue/30");
    expect(button).toHaveClass("text-ctp-blue");
  });
});
