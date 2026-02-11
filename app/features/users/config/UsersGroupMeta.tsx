"use client";

import { countNonAdminUsers, countUsersWithoutRole } from "../lib/userCounts";

type Row = { uid: string; data: any };

export function usersGroupMeta(_gid: "all", list: Row[]) {
  const total = countNonAdminUsers(list);
  const withoutRole = countUsersWithoutRole(list);

  return {
    title: "Brugere",
    subtitle: (
      <div className="flex-col flex-wrap items-center gap-2">
        <span>
          <p className="mt-1 text-sm text-slate-600">
            Tildel roller og crew-underroller.
          </p>
        </span>

        <span>
          {total} bruger{total === 1 ? "" : "e"}
        </span>

        {withoutRole > 0 && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700">{withoutRole} uden rolle</span>
          </>
        )}
      </div>
    ),
  };
}
