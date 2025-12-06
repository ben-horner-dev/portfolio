import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ErrorPage from "./error";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

it("renders error page with 500 status", () => {
  render(<ErrorPage />);

  expect(screen.getByText("500")).toBeInTheDocument();
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /go home/i })).toBeInTheDocument();
  expect(
    screen.getByText(/status: 500 internal server error/i),
  ).toBeInTheDocument();
});
