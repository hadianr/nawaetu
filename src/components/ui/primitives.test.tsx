/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

describe("shared UI primitives", () => {
  it("keeps interactive button sizes at the 44px minimum", () => {
    render(<Button size="default">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("h-11");
  });

  it("exposes an accessible open dialog and labeled close control", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>This action can be reviewed before saving.</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole("dialog", { name: "Confirm action" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close" })).toBeVisible();
  });
});
