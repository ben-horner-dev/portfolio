import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TypographyH3 } from "./h3";

it("TypographyH3 renders with text", () => {
  render(<TypographyH3 text="Test Heading" />);
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "Test Heading",
  );
});
