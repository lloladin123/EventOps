"use client";

import * as React from "react";
import { cx } from "./AdminNav/cx";

export default function Badge({
  count,
  tone = "rose",
}: {
  count: number;
  tone?: "rose" | "amber";
}) {
  if (count <= 0) return null;

  const toneCls =
    tone === "rose" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-900";

  return (
    <span
      className={cx(
        "ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
        toneCls,
      )}
      title={tone === "rose" ? "Nye anmodninger" : "Brugere uden rolle"}
    >
      {count}
    </span>
  );
}
