"use client";

import * as React from "react";
import OpenCloseButton from "./OpenCloseButton";

type Props = {
  title: React.ReactNode;
  right?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  variant?: "plain" | "card";
  children: React.ReactNode;
};

export function RequestsPanel({
  title,
  right,
  isOpen,
  onToggle,
  variant = "card",
  children,
}: Props) {
  const containerClass =
    variant === "plain"
      ? "p-4 space-y-3"
      : "rounded-2xl border-slate-200 bg-white shadow-sm p-4 space-y-3";

  return (
    <section className={containerClass}>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-baseline gap-3">{title}</div>

        <div className="flex items-center gap-2">
          {right}
          <OpenCloseButton
            target={isOpen ? "close" : "open"}
            onClick={onToggle}
          >
            {isOpen ? "Skjul" : "Vis"}
          </OpenCloseButton>
        </div>
      </div>

      {isOpen ? children : null}
    </section>
  );
}
