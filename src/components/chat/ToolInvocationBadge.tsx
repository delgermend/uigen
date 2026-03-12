"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";

  if (toolName === "str_replace_editor") {
    const command = args.command;
    if (command === "create") return `Creating file: ${basename(path)}`;
    if (command === "str_replace" || command === "insert") return `Editing file: ${basename(path)}`;
    if (command === "view") return `Reading file: ${basename(path)}`;
    if (command === "undo_edit") return `Undoing edit: ${basename(path)}`;
  }

  if (toolName === "file_manager") {
    const command = args.command;
    if (command === "delete") return `Deleting file: ${basename(path)}`;
    if (command === "rename") return `Renaming file: ${basename(path)}`;
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getToolLabel(
    toolInvocation.toolName,
    (toolInvocation.args ?? {}) as Record<string, unknown>
  );
  const isComplete = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200"
    )}>
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
