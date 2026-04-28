import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function SmokeComponent() {
  return <h1>web smoke test</h1>;
}

describe("web smoke", () => {
  it("renders component text", () => {
    render(<SmokeComponent />);
    expect(screen.getByRole("heading", { name: "web smoke test" })).toBeInTheDocument();
  });
});
