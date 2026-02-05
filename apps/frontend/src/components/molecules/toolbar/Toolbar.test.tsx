import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DevToolbar } from "./Toolbar";

vi.mock("@vercel/toolbar/next", () => ({
  VercelToolbar: vi.fn(() => (
    <div data-testid="vercel-toolbar">Vercel Toolbar</div>
  )),
}));

describe("DevToolbar", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("renders VercelToolbar when on localhost", () => {
    Object.defineProperty(global, "window", {
      value: {
        location: {
          hostname: "localhost",
        },
      },
      writable: true,
    });

    render(<DevToolbar />);

    expect(screen.getByTestId("vercel-toolbar")).toBeInTheDocument();
  });

  it("does not render VercelToolbar when not on localhost", () => {
    Object.defineProperty(global, "window", {
      value: {
        location: {
          hostname: "example.com",
        },
      },
      writable: true,
    });

    render(<DevToolbar />);

    expect(screen.queryByTestId("vercel-toolbar")).not.toBeInTheDocument();
  });

  it("does not render VercelToolbar on production domain", () => {
    Object.defineProperty(global, "window", {
      value: {
        location: {
          hostname: "mysite.vercel.app",
        },
      },
      writable: true,
    });

    render(<DevToolbar />);

    expect(screen.queryByTestId("vercel-toolbar")).not.toBeInTheDocument();
  });
});
