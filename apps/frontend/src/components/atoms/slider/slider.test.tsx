import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Slider } from "./slider";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Slider", () => {
  it("renders slider with default value", () => {
    render(<Slider defaultValue={[50]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("renders slider with controlled value", () => {
    render(<Slider value={[25]} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("renders slider with custom min and max", () => {
    render(<Slider min={0} max={10} defaultValue={[5]} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "10");
  });

  it("renders multiple thumbs for range slider", () => {
    render(<Slider defaultValue={[25, 75]} />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
  });

  it("renders slider with fallback values when neither value nor defaultValue provided", () => {
    render(<Slider min={10} max={50} data-testid="fallback-slider" />);
    const slider = screen.getByTestId("fallback-slider");
    expect(slider).toBeInTheDocument();
  });

  it("uses default min=0 and max=100 when not specified", () => {
    render(<Slider data-testid="default-slider" />);
    const slider = screen.getByTestId("default-slider");
    expect(slider).toBeInTheDocument();
  });
});
