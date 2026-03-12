import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "call"
): ToolInvocation {
  if (state === "result") {
    return { state: "result", toolCallId: "1", toolName, args, result: "ok" } as ToolInvocation;
  }
  return { state: "call", toolCallId: "1", toolName, args } as ToolInvocation;
}

describe("ToolInvocationBadge", () => {
  it("shows 'Creating file: App.tsx' for str_replace_editor create", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.tsx" })} />);
    expect(screen.getByText("Creating file: App.tsx")).toBeTruthy();
  });

  it("shows 'Editing file: App.tsx' for str_replace_editor str_replace", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" })} />);
    expect(screen.getByText("Editing file: App.tsx")).toBeTruthy();
  });

  it("shows 'Reading file: App.tsx' for str_replace_editor view", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/src/App.tsx" })} />);
    expect(screen.getByText("Reading file: App.tsx")).toBeTruthy();
  });

  it("shows 'Deleting file: App.tsx' for file_manager delete", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/src/App.tsx" })} />);
    expect(screen.getByText("Deleting file: App.tsx")).toBeTruthy();
  });

  it("shows 'Renaming file: App.tsx' for file_manager rename", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/src/App.tsx" })} />);
    expect(screen.getByText("Renaming file: App.tsx")).toBeTruthy();
  });

  it("falls back to raw tool name for unknown tools", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("unknown_tool", {})} />);
    expect(screen.getByText("unknown_tool")).toBeTruthy();
  });

  it("renders spinner in pending state and no green dot", () => {
    const { container } = render(
      <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.tsx" }, "call")} />
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  it("renders green dot in complete state and no spinner", () => {
    const { container } = render(
      <ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.tsx" }, "result")} />
    );
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
