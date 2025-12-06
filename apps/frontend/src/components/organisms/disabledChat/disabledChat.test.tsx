import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "@/components/atoms/button";
import { TypographyH2 } from "@/components/atoms/h2";
import { TypographyP } from "@/components/atoms/p";
import { ChatHeader } from "@/components/molecules/chatHeader";
import { LoginOverlay } from "@/components/molecules/loginOverlay";
import { DisabledChat } from "./disabledChat";
import * as DisabledChatModule from "./index";

it("renders disabled chat with header, messages, and overlay", () => {
  render(
    <DisabledChat
      header={
        <ChatHeader
          title={<TypographyH2 text="Chat" />}
          subtitle={<TypographyP text="Disabled" />}
        />
      }
      placeholderTexts={{ default: "Login to chat", typing: "Typing..." }}
      overlay={
        <LoginOverlay
          title={<TypographyH2 text="Login Required" />}
          description={<TypographyP text="Please login to use chat" />}
          loginButton={<Button>Login</Button>}
        />
      }
    />,
  );

  expect(screen.getByText("Chat")).toBeInTheDocument();
  expect(screen.getByText("Login Required")).toBeInTheDocument();
  expect(screen.getByText("Please login to use chat")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Login to chat")).toBeInTheDocument();
});

it("exports DisabledChat from index", () => {
  expect(DisabledChatModule.DisabledChat).toBe(DisabledChat);
});
