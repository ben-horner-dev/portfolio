import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import * as LoginBtnModule from "./index";
import { LoginButton } from "./loginBtn";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

it("renders login button with text", () => {
  render(<LoginButton text="Sign In" />);

  const link = screen.getByRole("link", { name: "Sign In" });
  expect(link).toBeInTheDocument();
  expect(link.getAttribute("href")).toBe("/auth/login?returnTo=%2F%23explore");
});

it("exports LoginButton from index", () => {
  expect(LoginBtnModule.LoginButton).toBe(LoginButton);
});
