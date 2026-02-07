"use client";

import * as React from "react";
import type { UserDoc } from "@/utils/users.firestore";
import type { Role } from "@/types/rsvp";

type Props = {
  uid: string;
  data: UserDoc;
  isFlashing: boolean;
  setRowRef?: (uid: string, el: HTMLElement | null) => void;
};

export function UserIdentityCell({ uid, data, isFlashing, setRowRef }: Props) {
  const hasRole = !!(data.role as Role | null);
  const needsRole = !hasRole;

  return (
    <div
      ref={(el) => setRowRef?.(uid, el)}
      className={[
        "flex items-stretch gap-3 rounded-lg px-2 py-1 transition-colors duration-300",
        isFlashing ? "bg-amber-100" : "bg-transparent",
      ].join(" ")}
    >
      <span
        className={[
          "w-1 shrink-0 rounded-full",
          needsRole ? "bg-amber-400" : "bg-transparent",
        ].join(" ")}
      />

      <div className="text-sm text-slate-900">
        <div className="font-medium">{data.displayName || "—"}</div>
        <div className="text-xs text-slate-500">{data.email || "—"}</div>
      </div>
    </div>
  );
}
