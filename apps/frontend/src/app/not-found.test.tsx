import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import NotFound from "./not-found";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

it("renders not found page with 404 status", () => {
  render(<NotFound />);

  expect(screen.getByText("404")).toBeInTheDocument();
  expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  expect(
    screen.getByText(/requested resource could not be found/i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /return home/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/status: 404/i)).toBeInTheDocument();
});
