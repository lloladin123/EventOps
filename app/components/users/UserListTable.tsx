"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

import GroupedTable from "@/components/ui/GroupedTable";
import type { SortState } from "@/components/ui/GroupedTable";
import { countNonAdminUsers, countUsersWithoutRole } from "../utils/userCounts";

type Props = {
  users: Array<{ uid: string; data: UserDoc }>;
  busy: boolean;
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => void | Promise<void>;

  // ✅ NEW
  deleteUser: (uid: string) => void | Promise<void>;
};

type Row = { uid: string; data: UserDoc };

// Single group id
type GroupId = "all";

type ColumnKey = "user" | "uid" | "role" | "subRole" | "actions";
type SortKey = Exclude<ColumnKey, "actions">;

function asText(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

export default function UserListTable({
  users,
  busy,
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
}: Props) {
  const visibleUsers = React.useMemo(
    () => users.filter(({ data }) => (data.role as Role | null) !== ROLE.Admin),
    [users]
  );

  const initialSort: SortState<SortKey> = { key: "user", dir: "asc" };

  if (busy) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        Loading users…
      </div>
    );
  }

  if (visibleUsers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
        No users found.
      </div>
    );
  }

  return (
    <GroupedTable<Row, GroupId, ColumnKey, SortKey>
      rows={visibleUsers}
      initialSort={initialSort}
      tableMinWidthClassName="min-w-[980px]"
      getGroupId={() => "all"}
      getGroupMeta={(_gid, list) => {
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
                  <span className="text-amber-700">
                    {withoutRole} uden rolle
                  </span>
                </>
              )}
            </div>
          ),
        };
      }}
      columns={[
        {
          key: "user",
          header: "Bruger",
          headerTitle: "Sortér efter navn",
          sortValue: (r) =>
            r.data.displayName?.trim() || r.data.email?.split("@")[0] || r.uid,
          cell: (r) => (
            <div className="text-sm text-slate-900">
              <div className="font-medium">{r.data.displayName || "—"}</div>
              <div className="text-xs text-slate-500">
                {r.data.email || "—"}
              </div>
            </div>
          ),
        },
        {
          key: "uid",
          header: "UID",
          headerTitle: "Sortér efter UID",
          sortValue: (r) => asText(r.uid),
          cell: (r) => <code className="text-xs text-slate-700">{r.uid}</code>,
        },
        {
          key: "role",
          header: "Rolle",
          headerTitle: "Sortér efter rolle",
          sortValue: (r) => asText(r.data.role ?? ""),
          cell: (r) => {
            const role = (r.data.role ?? null) as Role | null;

            return (
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                value={role ?? ""}
                onChange={(e) => setUserRole(r.uid, e.target.value as Role)}
              >
                <option value="" disabled>
                  Select role…
                </option>
                {roles
                  .filter((x) => x !== ROLE.Admin)
                  .map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            );
          },
        },
        {
          key: "subRole",
          header: "Under rolle",
          headerTitle: "Sortér efter subrole",
          sortValue: (r) => asText(r.data.subRole ?? ""),
          cell: (r) => {
            const role = (r.data.role ?? null) as Role | null;
            const subRole = (r.data.subRole ?? null) as CrewSubRole | null;
            const isCrew = role === ROLE.Crew;

            return isCrew ? (
              <select
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                value={subRole ?? ""}
                onChange={(e) =>
                  setUserSubRole(
                    r.uid,
                    e.target.value ? (e.target.value as CrewSubRole) : null
                  )
                }
              >
                <option value="">(none)</option>
                {crewSubRoles.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-slate-400">—</span>
            );
          },
        },
        {
          key: "actions",
          header: " ",
          align: "right",
          cell: (r) => (
            <button
              type="button"
              onClick={async () => {
                const name =
                  r.data.displayName?.trim() ||
                  r.data.email?.trim() ||
                  r.uid.slice(0, 8);

                const ok = window.confirm(
                  `Slet bruger "${name}"?\n\nDette kan ikke fortrydes.`
                );
                if (!ok) return;

                await deleteUser(r.uid);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
              title="Slet bruger"
              aria-label="Slet bruger"
            >
              Slet
            </button>
          ),
        },
      ]}
    />
  );
}
