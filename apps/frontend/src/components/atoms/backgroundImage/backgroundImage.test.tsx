import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { BackgroundImage } from "./backgroundImage";
import * as BackgroundImageModule from "./index";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority,
  }: {
    src: unknown;
    alt: string;
    priority?: boolean;
    // biome-ignore lint/performance/noImgElement: This is a test mock, not production code
  }) => <img src={String(src)} alt={alt} data-priority={priority} />,
}));

const mockImage = {
  src: "/test.jpg",
  height: 100,
  width: 100,
} as const;

it("renders background image with default priority", () => {
  const { container } = render(
    <BackgroundImage src={mockImage} alt="Test background" />,
  );

  const img = container.querySelector("img");
  expect(img).not.toBeNull();
  expect(img?.getAttribute("alt")).toBe("Test background");
  expect(img?.getAttribute("data-priority")).toBe("true");
});

it("renders background image with custom priority", () => {
  const { container } = render(
    <BackgroundImage src={mockImage} alt="Test background" priority={false} />,
  );

  const img = container.querySelector("img");
  expect(img).not.toBeNull();
  expect(img?.getAttribute("data-priority")).toBe("false");
});

it("exports BackgroundImage from index", () => {
  expect(BackgroundImageModule.BackgroundImage).toBe(BackgroundImage);
});
