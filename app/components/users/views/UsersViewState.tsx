"use client";

import * as React from "react";

type Props = {
  busy: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
};

export function UsersViewState({ busy, isEmpty, children }: Props) {
  if (busy) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Loading users…
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        No users found.
      </div>
    );
  }

  return <>{children}</>;
}
