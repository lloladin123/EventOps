"use client";

import * as React from "react";
import { usePanelArrowNav } from "../hooks/usePanelArrowNav";
import OpenCloseButton from "@/components/ui/patterns/OpenCloseButton";

type Props = {
  title: React.ReactNode;
  right?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  variant?: "plain" | "card";
  children: React.ReactNode;

  // ✅ new: change this to retrigger autofocus (e.g. "list" | "table")
  focusKey?: unknown;
};

export function RequestsPanel({
  title,
  right,
  isOpen,
  onToggle,
  variant = "card",
  children,
  focusKey,
}: Props) {
  const containerClass =
    variant === "plain"
      ? "p-4 space-y-3"
      : "rounded-2xl border-slate-200 bg-white shadow-sm p-4 space-y-3";

  const ref = React.useRef<HTMLElement | null>(null);

  // ✅ ArrowUp/Down within list/table, Shift+ArrowUp/Down between events
  usePanelArrowNav(ref, isOpen);

  // ✅ Auto-focus first row when opening OR when focusKey changes (view mode)
  React.useEffect(() => {
    if (!isOpen) return;

    const panel = ref.current;
    if (!panel) return;

    // don’t steal focus if the user is already inside the panel
    const active = document.activeElement as HTMLElement | null;
    if (active && panel.contains(active)) return;

    const first = panel.querySelector<HTMLElement>("[data-eventid][data-uid]");
    first?.focus();
  }, [isOpen, focusKey]);

  return (
    <section ref={ref} className={containerClass}>
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
