"use client";

import { countNonAdminUsers } from "../lib/userCounts";

type Row = { uid: string; data: any };

export function usersGroupMeta(_gid: "all", list: Row[]) {
  const total = countNonAdminUsers(list);

  return {
    title: "Brugere",
    subtitle: (
      <div className="flex-col flex-wrap items-center gap-2">
        <span>
          <p className="mt-1 text-sm text-slate-600">Tildel systemroller</p>
        </span>

        <span>
          {total} bruger{total === 1 ? "" : "e"}
        </span>
      </div>
    ),
  };
}
