import * as React from "react";

export function nodeToTitle(node: React.ReactNode): string | undefined {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  return undefined;
}

export function tdClassName(
  align: "left" | "right" | undefined,
  className?: string,
) {
  const a = align === "right" ? "text-right" : "text-left";
  return ["px-4 py-2 align-top", a, className].filter(Boolean).join(" ");
}

export function wrapClassName(maxWidthClassName?: string) {
  return ["truncate", maxWidthClassName ?? "max-w-[320px]", "block"].join(" ");
}
