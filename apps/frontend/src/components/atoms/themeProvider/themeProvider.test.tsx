import { render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { ThemeProvider } from "./themeProvider";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

it("ThemeProvider renders children", () => {
  render(
    <ThemeProvider attribute="class" defaultTheme="system">
      <div>Test Child</div>
    </ThemeProvider>,
  );
  expect(screen.getByText("Test Child")).toBeInTheDocument();
});
