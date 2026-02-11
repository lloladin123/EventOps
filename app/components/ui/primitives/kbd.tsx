"use client";
import * as React from "react";
import { cn } from "@/app/components/ui/utils/cn";

export function Kbd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "hidden rounded border border-slate-300 bg-slate-100 px-1 text-[10px] font-mono text-slate-500 group-hover:inline",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
