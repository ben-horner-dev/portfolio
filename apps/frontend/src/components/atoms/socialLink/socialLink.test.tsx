import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SocialLink } from "./socialLink";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: Intentionally using img to mock Next.js Image in tests
    <img alt={alt} src={src} />
  ),
}));

it("SocialLink renders with link and image", () => {
  const mockImgGttr = vi.fn().mockReturnValue("/test-image.png");
  render(
    <SocialLink
      href="https://example.com"
      alt="Test Social"
      src="test.png"
      imgGttr={mockImgGttr}
    />,
  );
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "https://example.com",
  );
  expect(screen.getByRole("img")).toHaveAttribute("alt", "Test Social");
  expect(mockImgGttr).toHaveBeenCalledWith("test.png");
});
