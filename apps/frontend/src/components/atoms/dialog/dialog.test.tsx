import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("renders dialog with trigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders open dialog with content", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer Content</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("renders dialog without close button when showCloseButton is false", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No Close Button</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("No Close Button")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("renders dialog footer with close button when showCloseButton is true", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogFooter showCloseButton>Done</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders DialogClose component standalone", () => {
    render(
      <Dialog open>
        <DialogPortal>
          <DialogOverlay />
          <DialogClose data-testid="dialog-close-standalone">
            Custom Close
          </DialogClose>
        </DialogPortal>
      </Dialog>,
    );
    expect(screen.getByTestId("dialog-close-standalone")).toBeInTheDocument();
    expect(screen.getByText("Custom Close")).toBeInTheDocument();
  });
});
