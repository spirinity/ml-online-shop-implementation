import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { cn } from "@/lib/utils";

describe("test harness smoke test", () => {
  it("renders React into jsdom and supports jest-dom matchers", () => {
    render(<button type="button">Click me</button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("resolves the @/ path alias to src", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("has access to the jsdom document", () => {
    expect(typeof document).toBe("object");
    expect(document.body).toBeTruthy();
  });
});
