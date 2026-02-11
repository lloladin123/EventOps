"use client";

import * as React from "react";
import { ROLE } from "@/types/rsvp";
import type { Role, CrewSubRole } from "@/types/rsvp";
import type { UserDoc } from "@/lib/firestore/users.client";

import {
  neutralSelectClass,
  roleSelectClass,
} from "../config/userSelectStyles";
import { RoleOptions } from "../config/RoleOptions";

type Row = { uid: string; data: UserDoc };

type Params = {
  roles: readonly Role[];
  crewSubRoles: readonly CrewSubRole[];
  setUserRole: (uid: string, nextRole: Role) => void | Promise<void>;
  setUserSubRole: (
    uid: string,
    nextSubRole: CrewSubRole | null,
  ) => void | Promise<void>;
  deleteUser: (uid: string) => void | Promise<void>;

  // navigation
  focusMissingRelative: (fromUid: string | null, dir: 1 | -1) => void;

  // ui helpers
  flashUid: string | null;
  flash: (uid: string) => void; // ✅ add
  focusRoleSelect: (uid: string) => void;

  setRowRef: (uid: string, el: HTMLElement | null) => void;
  setRoleRef: (uid: string, el: HTMLSelectElement | null) => void;

  // confirm
  confirmDeleteUser: (uid: string, data: UserDoc) => boolean;
};

export function buildUserListRenderRow({
  roles,
  crewSubRoles,
  setUserRole,
  setUserSubRole,
  deleteUser,
  focusMissingRelative,
  flashUid,
  flash,
  focusRoleSelect,
  setRowRef,
  setRoleRef,
  confirmDeleteUser,
}: Params) {
  return function renderRow(r: Row) {
    const displayName = r.data.displayName?.trim() || "—";
    const email = r.data.email?.trim() || "—";
    const role = (r.data.role ?? null) as Role | null;
    const subRole = (r.data.subRole ?? null) as CrewSubRole | null;

    const needsRole = !role;
    const isCrew = role === ROLE.Crew;

    return (
      <div
        ref={(el) => setRowRef(r.uid, el)}
        tabIndex={0}
        data-uid={r.uid}
        onClick={(e) => {
          const t = e.target as HTMLElement | null;
          if (t?.closest("button,a,input,select,textarea,[role='button']"))
            return;
          flash(r.uid);
          focusRoleSelect(r.uid);
          (e.currentTarget as HTMLElement).focus();
        }}
        className={[
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between transition-colors duration-300",
          needsRole ? "border-l-4 border-l-amber-400" : "",
          flashUid === r.uid ? "bg-amber-100" : "", // ✅ highlight
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Left */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </div>

            {needsRole ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                Mangler rolle
              </span>
            ) : null}
          </div>

          <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            <div className="flex-1 min-w-0">
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="truncate text-slate-700">{email}</dd>
            </div>

            <div className="min-w-0 flex-1">
              <dt className="font-semibold text-slate-500">UID</dt>
              <dd className="text-slate-700">
                <code className="block truncate text-slate-700" title={r.uid}>
                  {r.uid}
                </code>
              </dd>
            </div>
          </dl>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-600">
                Rolle
              </div>

              <select
                ref={(el) => setRoleRef(r.uid, el)}
                data-uid={r.uid}
                className={roleSelectClass(needsRole)}
                value={role ?? ""}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();

                  const picked = (e.currentTarget.value || "") as Role | "";
                  if (!picked) return;

                  // IMPORTANT: no subrole focus/flash
                  if (picked !== ROLE.Crew) {
                    requestAnimationFrame(() => focusMissingRelative(r.uid, 1));
                  }
                }}
                onChange={async (e) => {
                  const next = e.target.value as Role;
                  await setUserRole(r.uid, next);

                  // IMPORTANT: no subrole focus/flash
                  if (next !== ROLE.Crew) {
                    requestAnimationFrame(() => focusMissingRelative(r.uid, 1));
                  }
                }}
              >
                <RoleOptions roles={roles} />
              </select>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold text-slate-600">
                Under rolle
              </div>

              {isCrew ? (
                <select
                  data-uid={r.uid}
                  className={neutralSelectClass}
                  value={subRole ?? ""}
                  onChange={(e) =>
                    setUserSubRole(
                      r.uid,
                      e.target.value ? (e.target.value as CrewSubRole) : null,
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
                <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-400">
                  —
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="shrink-0 sm:pt-0.5">
          <button
            type="button"
            onClick={async () => {
              if (!confirmDeleteUser(r.uid, r.data)) return;
              await deleteUser(r.uid);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 active:scale-[0.99]"
            title="Slet bruger"
            aria-label="Slet bruger"
          >
            Slet
          </button>
        </div>
      </div>
    );
  };
}
