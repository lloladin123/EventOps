"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/utils/users.firestore";

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
};

export default function UserListTable({
  users,
  busy,
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
              User
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
              UID
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
              Role
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
              SubRole
            </th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {busy ? (
            <tr>
              <td className="px-4 py-4 text-sm text-slate-600" colSpan={5}>
                Loading users…
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-sm text-slate-600" colSpan={5}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map(({ uid, data }) => {
              const role = (data.role ?? null) as Role | null;
              const subRole = (data.subRole ?? null) as CrewSubRole | null;
              const isCrew = role === ROLE.Crew;

              return (
                <tr key={uid} className="border-t">
                  <td className="px-4 py-2 text-sm text-slate-900">
                    <div className="font-medium">{data.displayName || "—"}</div>
                    <div className="text-xs text-slate-500">
                      {data.email || "—"}
                    </div>
                  </td>

                  <td className="px-4 py-2 text-xs text-slate-700">
                    <code className="text-xs">{uid}</code>
                  </td>

                  <td className="px-4 py-2">
                    <select
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                      value={role ?? ""}
                      onChange={(e) => setUserRole(uid, e.target.value as Role)}
                    >
                      <option value="" disabled>
                        Select role…
                      </option>
                      {roles.map((roleOpt) => (
                        <option key={roleOpt} value={roleOpt}>
                          {roleOpt}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-2">
                    {isCrew ? (
                      <select
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                        value={subRole ?? ""}
                        onChange={(e) =>
                          setUserSubRole(
                            uid,
                            e.target.value
                              ? (e.target.value as CrewSubRole)
                              : null
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
                    )}
                  </td>

                  <td className="px-4 py-2 text-right text-xs text-slate-500"></td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
