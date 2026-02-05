import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuestButton } from "./guestBtn";

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
      variant,
      className,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
      size?: string;
      variant?: string;
      className?: string;
    }) => (
      <div
        data-testid="button"
        data-aschild={asChild}
        data-size={size}
        data-variant={variant}
        className={className}
      >
        {children}
      </div>
    ),
  ),
}));

describe("GuestButton", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the button with provided text", () => {
    render(<GuestButton text="Continue as Guest" />);

    expect(screen.getByText("Continue as Guest")).toBeInTheDocument();
  });

  it("renders with correct link href for guest mode", () => {
    render(<GuestButton text="Guest" />);

    const link = screen.getByTestId("link");
    expect(link).toHaveAttribute("href", "/?guest=true#explore");
  });

  it("renders with different text", () => {
    render(<GuestButton text="Try without signing in" />);

    expect(screen.getByText("Try without signing in")).toBeInTheDocument();
  });

  it("renders Button with asChild prop", () => {
    render(<GuestButton text="Guest" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-aschild", "true");
  });

  it("renders Button with lg size", () => {
    render(<GuestButton text="Guest" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("renders Button with outline variant", () => {
    render(<GuestButton text="Guest" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-variant", "outline");
  });

  it("renders Button with styling classes", () => {
    render(<GuestButton text="Guest" />);

    const button = screen.getByTestId("button");
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("hover:bg-muted/50");
    expect(button).toHaveClass("text-muted-foreground");
  });
});
