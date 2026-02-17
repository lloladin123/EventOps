"use client";

import type { UserDoc } from "@/lib/firestore/users.client";

type Props = {
  uid: string;
  data: UserDoc;
  setRowRef?: (uid: string, el: HTMLElement | null) => void;
  onActivate?: () => void;
};

export function UserIdentityCell({ uid, data, setRowRef, onActivate }: Props) {
  return (
    <div
      ref={(el) => setRowRef?.(uid, el)}
      tabIndex={0}
      data-userfocus="row"
      data-uid={uid}
      onClick={(e) => {
        const t = e.target as HTMLElement | null;
        if (t?.closest("button,a,input,select,textarea,[role='button']"))
          return;

        onActivate?.();
        (e.currentTarget as HTMLElement).focus();
      }}
      className={[
        "flex items-stretch gap-3 rounded-lg px-2 py-1",
        "cursor-pointer outline-none transition-colors duration-200",
      ].join(" ")}
    >
      <span aria-hidden className="w-1 shrink-0 rounded-full" />

      <div className="pointer-events-none text-sm text-slate-900">
        <div className="font-medium">{data.displayName || "—"}</div>
        <div className="text-xs text-slate-500">{data.email || "—"}</div>
      </div>
    </div>
  );
}
