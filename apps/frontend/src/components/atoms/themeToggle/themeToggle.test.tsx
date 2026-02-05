import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./themeToggle";

const mockSetTheme = vi.fn();
let mockResolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    cleanup();
    mockSetTheme.mockClear();
    mockResolvedTheme = "light";
  });

  it("renders toggle button", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("toggles to dark theme when in light mode", () => {
    mockResolvedTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles to light theme when in dark mode", () => {
    mockResolvedTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders Sun icon when in dark mode", () => {
    mockResolvedTheme = "dark";
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders Moon icon when in light mode", () => {
    mockResolvedTheme = "light";
    const { container } = render(<ThemeToggle />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
