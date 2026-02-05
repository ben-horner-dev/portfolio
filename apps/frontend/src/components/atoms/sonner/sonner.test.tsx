import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Toaster } from "./sonner";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

it("Toaster renders without crashing", () => {
  const { container } = render(<Toaster />);
  expect(container.querySelector("section")).toBeInTheDocument();
});
