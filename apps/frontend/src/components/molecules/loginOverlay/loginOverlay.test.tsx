import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "@/components/atoms/button";
import { TypographyH2 } from "@/components/atoms/h2";
import { TypographyP } from "@/components/atoms/p";
import { LoginOverlay } from "./loginOverlay";

it("renders login overlay with title, description, and button", () => {
  render(
    <LoginOverlay
      title={<TypographyH2 text="Please Login" />}
      description={<TypographyP text="You need to login to continue" />}
      loginButton={<Button>Login</Button>}
    />,
  );

  expect(screen.getByText("Please Login")).toBeInTheDocument();
  expect(screen.getByText("You need to login to continue")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});
