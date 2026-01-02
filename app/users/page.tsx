"use client";

import * as React from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase/client";
import { useAuth } from "@/app/components/auth/AuthProvider";
import type { Role, CrewSubRole } from "@/types/rsvp";
import { ROLES, CREW_SUBROLES } from "@/types/rsvp";

type UserDoc = {
  email?: string;
  displayName?: string;
  role?: Role;
  subRole?: CrewSubRole | null;
};

export default function UsersPage() {
  const { role: myRole, loading } = useAuth();

  const [roles, setRoles] = React.useState<readonly Role[]>(ROLES);
  const [crewSubRoles, setCrewSubRoles] =
    React.useState<readonly CrewSubRole[]>(CREW_SUBROLES);

  const [users, setUsers] = React.useState<
    Array<{ uid: string; data: UserDoc }>
  >([]);
  const [busy, setBusy] = React.useState(true);

  // Load role catalog from config/roles (fallback to constants if missing)
  React.useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "config", "roles"));
        if (!snap.exists()) return;
        const data = snap.data() as any;

        if (Array.isArray(data.roles)) setRoles(data.roles as Role[]);
        if (Array.isArray(data.crewSubRoles))
          setCrewSubRoles(data.crewSubRoles as CrewSubRole[]);
      } catch {
        // ignore: fallback stays
      }
    })();
  }, []);

  // Subscribe to users collection (admin only)
  React.useEffect(() => {
    if (loading) return;
    if (myRole !== "Admin") return;

    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const rows = snap.docs.map((d) => ({
        uid: d.id,
        data: d.data() as UserDoc,
      }));

      rows.sort((a, b) =>
        (a.data.email || "").localeCompare(b.data.email || "")
      );
      setUsers(rows);
      setBusy(false);
    });

    return () => unsub();
  }, [loading, myRole]);

  const setUserRole = async (uid: string, nextRole: Role) => {
    // When switching away from Crew, wipe subRole
    await updateDoc(doc(db, "users", uid), {
      role: nextRole,
      subRole: nextRole === "Crew" ? null : null,
    });
  };

  const setUserSubRole = async (
    uid: string,
    nextSubRole: CrewSubRole | null
  ) => {
    await updateDoc(doc(db, "users", uid), {
      subRole: nextSubRole,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (myRole !== "Admin") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-600">No access.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Assign roles and crew subroles.
        </p>
      </div>

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
                const r = (data.role ?? null) as Role | null;
                const sr = (data.subRole ?? null) as CrewSubRole | null;

                return (
                  <tr key={uid} className="border-t">
                    <td className="px-4 py-2 text-sm text-slate-900">
                      <div className="font-medium">
                        {data.displayName || "—"}
                      </div>
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
                        value={r ?? ""}
                        onChange={(e) =>
                          setUserRole(uid, e.target.value as Role)
                        }
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
                      {r === "Crew" ? (
                        <select
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                          value={sr ?? ""}
                          onChange={(e) =>
                            setUserSubRole(uid, (e.target.value || null) as any)
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
    </div>
  );
}
